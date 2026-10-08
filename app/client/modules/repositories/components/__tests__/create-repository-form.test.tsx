import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, userEvent, waitFor } from "~/test/test-utils";
import { CreateRepositoryForm, type RepositoryFormValues } from "../create-repository-form";

vi.mock("~/server/lib/functions/server-constants", () => ({
	getServerConstants: async () => ({ REPOSITORY_BASE: "/backups" }),
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("~/client/hooks/use-system-info", () => ({
	useSystemInfo: () => ({ capabilities: { repositoryBackends: ["local", "s3"] } }),
}));

afterEach(cleanup);

const renderForm = (initialValues: Partial<RepositoryFormValues> = {}, mode: "create" | "update" = "create") => {
	const onSubmit = vi.fn();
	render(
		<>
			<CreateRepositoryForm
				formId="repository-form"
				mode={mode}
				onSubmit={onSubmit}
				initialValues={{
					name: "Backups",
					backend: "local",
					path: "/backups",
					compressionMode: "auto",
					...initialValues,
				}}
			/>
			<button type="submit" form="repository-form">
				Submit
			</button>
		</>,
		{ withSuspense: true },
	);
	return onSubmit;
};

const selectPasswordSource = async (value: "default" | "custom") => {
	const trigger = await screen.findByRole("combobox", { name: "Password source" });
	const select = trigger.parentElement?.querySelector('select[aria-hidden="true"]');
	if (!(select instanceof HTMLSelectElement)) throw new Error("Password source select not found");
	fireEvent.change(select, { target: { value } });
};

test("creates a new repository with a confirmed independent password", async () => {
	const onSubmit = renderForm();
	await selectPasswordSource("custom");
	await userEvent.type(screen.getByPlaceholderText("Enter repository password"), "my-repository-password");
	await userEvent.type(screen.getByLabelText("Confirm repository password"), "my-repository-password");
	await userEvent.click(screen.getByText("Submit"));
	await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
	expect(onSubmit.mock.calls[0][0]).toMatchObject({ customPassword: "my-repository-password" });
	expect(onSubmit.mock.calls[0][0]).not.toHaveProperty("passwordConfirmation");
	expect(onSubmit.mock.calls[0][0].isExistingRepository).not.toBe(true);
});

test("rejects an empty independent password and mismatched confirmation", async () => {
	const onSubmit = renderForm();
	await selectPasswordSource("custom");
	await userEvent.click(screen.getByText("Submit"));
	expect(await screen.findByText("Enter a repository password")).toBeTruthy();
	await userEvent.type(screen.getByPlaceholderText("Enter repository password"), "my-password");
	await userEvent.type(screen.getByLabelText("Confirm repository password"), "different-password");
	await userEvent.click(screen.getByText("Submit"));
	expect(await screen.findByText("Passwords do not match")).toBeTruthy();
	expect(onSubmit).not.toHaveBeenCalled();
});

test("clears the independent password when switching back to the organization key", async () => {
	const onSubmit = renderForm();
	await selectPasswordSource("custom");
	await userEvent.type(screen.getByPlaceholderText("Enter repository password"), "unused-password");
	await selectPasswordSource("default");
	expect(screen.queryByLabelText("Confirm repository password")).toBeNull();
	await userEvent.click(screen.getByText("Submit"));
	await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
	expect(onSubmit.mock.calls[0][0].customPassword).toBeUndefined();
});

test("imports an existing repository without requiring password confirmation", async () => {
	const onSubmit = renderForm({ isExistingRepository: true });
	await selectPasswordSource("custom");
	await userEvent.type(screen.getByPlaceholderText("Enter repository password"), "existing-password");
	expect(screen.queryByLabelText("Confirm repository password")).toBeNull();
	await userEvent.click(screen.getByText("Submit"));
	await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
	expect(onSubmit.mock.calls[0][0]).toMatchObject({
		isExistingRepository: true,
		customPassword: "existing-password",
	});
});

test("preserves the password while editing a repository created with an independent password", async () => {
	const onSubmit = renderForm({ customPassword: "encv1:stored-password" }, "update");
	expect(await screen.findByText(/This repository uses an independent password/)).toBeTruthy();
	expect(screen.queryByRole("combobox", { name: "Password source" })).toBeNull();
	await userEvent.click(screen.getByText("Submit"));
	await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
	expect(onSubmit.mock.calls[0][0]).toMatchObject({ customPassword: "encv1:stored-password" });
});
