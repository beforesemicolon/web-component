import {If} from './if.directive';
import {Ref} from './ref.directive';
import {Attr} from './attr.directive';
import {Repeat} from './repeat.directive';

If.register();
Ref.register();
Attr.register();
Repeat.register();

export const directives = new Set([
	If.name.toLowerCase(),
	Ref.name.toLowerCase(),
	Attr.name.toLowerCase(),
	Repeat.name.toLowerCase(),
])
