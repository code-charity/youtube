/**
 * @fileoverview Types for migrate-config package.
 */

export interface MigrationImport {
	/**
	 * The name to use to import the entire module.
	 */
	name?: string;

	/**
	 * The names to import from the module.
	 */
	bindings?: string[];

	/**
	 * Whether the import is added by the migration.
	 */
	added?: boolean;
}
