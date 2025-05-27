import { formatFiles, Tree } from '@nx/devkit';
import { replaceUsages } from '../base/lib/utils/replace-package';
import { MigrateAlertDialogHelmGeneratorSchema } from './schema';

export async function migrateAlertDialogHelm(tree: Tree, options: MigrateAlertDialogHelmGeneratorSchema) {
	const oldImport = '@spartan-ng/ui-alertdialog-helm';
	const newImport = '@spartan-ng/ui-alert-dialog-helm';

	replaceUsages(tree, oldImport, newImport);
	if (!options.skipFormat) {
		await formatFiles(tree);
	}
}

export default migrateAlertDialogHelm;
