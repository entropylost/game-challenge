'use strict';

/* Globals */
((
    createArr /* Create an array without using the array literal syntax. */
,   fc /* Calls a function with arguments first. */
,   fix /* Fixedpoint functor. */
) => {
})(
    /* createArr */ (...x) => x
,   /* fc */ (args) => (f) => f(...args)
,   /* fix */
    ((fix) => (initialArgs) => (f) => f(initialArgs, (...args) => fix(fix)(...args)(f)))
    ((fix) => (initialArgs) => (f) => f(initialArgs, (...args) => fix(fix)(...args)(f)))
);
