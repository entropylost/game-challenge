'use strict';

/* Globals */
((
    createArr /* Create an array without using the array literal syntax. */
,   fc /* Calls a function with arguments first. */
,   fix /* Fixedpoint functor. */
,   canvas /* The 2d context of the canvas. */
,   size /* The size of the canvas. */
,   dt /* Timestep. */
) => {
    console.log(canvas);
    canvas.scale(size / 2, size / 2);
    canvas.translate(1, 1);
    // canvas.transform(2 / size, 0, 0, 2 / size, 0, 0);
    /* The 0th entity is the player */
    fix(
        createArr(0),
        createArr(0),
        createArr(0.3),
        createArr(0),
        createArr(0.2),
    )((f, posXArr, posYArr, velXArr, velYArr, sizeArr) => {
        canvas.clearRect(-1, -1, 2, 2);
        sizeArr.forEach((size, i) => {
            canvas.beginPath();
            canvas.arc(posXArr[i], posYArr[i], size, 0, 2 * Math.PI);
            canvas.fill();
        });
        // canvas.fillRect(-0.9, -0.9, 0.9 * 2, 0.9 * 2);
        fc(
            posXArr.map((p, i) => p + velXArr[i] * dt),
            posYArr.map((p, i) => p + velYArr[i] * dt),
        )((posXArrNew, posYArrNew) =>
            requestAnimationFrame(() => f(
                posXArrNew,
                posYArrNew,
                velXArr.map((v, i) => (Math.abs(posXArrNew[i]) < 1 - sizeArr[i]) ? v : -v),
                velYArr.map((v, i) => (Math.abs(posYArrNew[i]) < 1 - sizeArr[i]) ? v : -v),
                sizeArr
            ))
        )
    })
})(
    /* createArr */ (...x) => x
,   /* fc */ (...args) => (f) => f(...args)
,   /* fix */
    ((fix) => (...initialArgs) => (f) => f((...args) => fix(fix)(...args)(f), ...initialArgs))
    ((fix) => (...initialArgs) => (f) => f((...args) => fix(fix)(...args)(f), ...initialArgs))
,   /* canvas */ document.getElementById('canvas').getContext('2d')
,   /* size */ 500
,   /* dt */ 1 / 60
);
