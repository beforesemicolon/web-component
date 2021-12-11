/**
 * metadata is a simple global object that is used to store data related to the node
 * to prevent attaching properties on the node directly also to prevent this data
 * to be manipulated when user has reference of the node object.
 *
 * it weak nature also means that when no node reference exist, these data will simply be
 * garbage collected
 */
export const metadata: WeakMap<any, any> = new WeakMap();
