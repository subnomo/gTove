
/**
 * This function builds a reducer to manage multiple identical pieces of substate stored in a map (actually, a regular
 * Javascript object being treated like a map), each managed by the same sub-reducer, stored under different key values.
 * For example, if you have a reducer than can handle the actions for a single problem, then calling this function with
 * an actionKey of 'problemId' and that (sub)reducer will return a reducer that can handle multiple problems, with each
 * problem's state stored in a top-level object under its own problemId.  Actions will operate on the appropriate
 * problem state using action.problemId to work out what piece of the multiple-problems state to pass to the subReducer.
 *
 * @param actionKey The field stored in the action which contains the key into the state at this level which needs to be
 * reduced.  Note that this key can be a single value, or it can be an array of key values, in which case the action is
 * performed on each key value in the array.
 * @param subReducer The reducer which will be called to (potentially) give a new value for the sub-state stored under
 * the key(s).  A slightly hacky non-Redux behaviour for this subReducer is that if it returns a result of undefined,
 * the key(s) are deleted.  It is preferable to instead use the options.deleteActionType parameter to perform deletions
 * if they happen unconditionally on a given action type; this "return undefined to delete" mechanism exists to support
 * conditional deletes.  It does have the nice semantics that using it to delete a key that doesn't currently exist
 * means the state is returned verbatim (because the returned state from subReducer === the (non-existent) previous
 * state, i.e. they're both undefined).
 * @param options (optional) Contains optional options for this reducer - see below.
 * @param options.field (optional) If specified, drills down into that field in the state before looking up the keys derived
 * from actionKey.
 * @param options.deleteActionType (optional) If specified, an action with the given action type which contains the expected
 * actionKey will delete the state under that key value(s).
 *
 * @returns A reducer which manages multiple keyed sub-states using the common subReducer on each.
 *
 */
export const objectMapReducer = (actionKey, subReducer, options = {}) => (state = {}, action) => {
    if (action[actionKey] === undefined) {
        return state;
    }
    let {field = null, deleteActionType = null} = options;
    const key = action[actionKey];
    const keyedState = field ? (state[field] || {}) : state;
    let result = null;
    if (Array.isArray(key)) {
        key.forEach((singleKey) => {
            result = updateSingleKey(subReducer, deleteActionType, result, keyedState, singleKey, action);
        });
    } else {
        result = updateSingleKey(subReducer, deleteActionType, result, keyedState, key, action);
    }
    if (!result) {
        return state;
    } else if (field) {
        return {...state, [field]: result};
    } else {
        return result;
    }
};

// Internal function used by objectMapReducer
const updateSingleKey = (subReducer, deleteActionType, result, state, key, action) => {
    if (deleteActionType && action.type === deleteActionType) {
        if (state[key]) {
            if (!result) {
                result = {...state};
            }
            delete(result[key]);
        }
    } else {
        const subState = subReducer(state[key], action);
        if (subState !== state[key]) {
            if (!result) {
                result = {...state};
            }
            if (subState === undefined) {
                delete(result[key]);
            } else {
                result[key] = subState;
            }
        }
    }
    return result;
};