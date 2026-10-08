import { Database } from "bun:sqlite";
import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("preserves the passwords used by old repositories during the database upgrade", async () => {
	const db = new Database(":memory:");
	try {
		db.exec("CREATE TABLE repositories_table (id INTEGER PRIMARY KEY, config TEXT NOT NULL)");
		const configs = [
			{ backend: "local", path: "/repo", customPassword: "ignored-password" },
			{ backend: "local", path: "/repo", isExistingRepository: false, customPassword: "ignored-password" },
			{ backend: "local", path: "/repo", isExistingRepository: true, customPassword: "active-password" },
			{ backend: "local", path: "/repo", isExistingRepository: true },
			{ backend: "local", path: "/repo" },
		];
		for (const config of configs)
			db.run("INSERT INTO repositories_table (config) VALUES (?)", [JSON.stringify(config)]);
		const migration = await readFile(
			new URL("../../../drizzle/20261008032612_normalize-repository-passwords/migration.sql", import.meta.url),
			"utf8",
		);
		db.exec(migration);
		const rows = db.query<{ config: string }, []>("SELECT config FROM repositories_table ORDER BY id").all();
		expect(rows.map(({ config }) => JSON.parse(config))).toEqual([
			{ backend: "local", path: "/repo" },
			{ backend: "local", path: "/repo", isExistingRepository: false },
			...configs.slice(2),
		]);
	} finally {
		db.close();
	}
});
