'use strict';

/* Globals */
((
    createArr
,   fc /* Calls a function with arguments first. */
,   fix /* Fixedpoint functor. */
,   canvas /* The 2d context of the canvas. */
,   size /* The size of the canvas. */
,   dt
,   startingTime
,   accelRatio
) => {
    console.log(canvas);
    canvas.scale(size / 2, size / 2);
    canvas.translate(1, 1);
    /* The 0th entity is the player */
    fix(
        createArr(0),
        createArr(0),
        createArr(0.2),
        createArr(0.15),
        createArr(0.1),
        [0, 0, 0, 0],
        0,
        false,
        document.getElementById('keydetector')
    )((
        f,
        posXArr,
        posYArr,
        velXArr,
        velYArr,
        sizeArr,
        accel,
        tick,
        lost,
        keydetector,
    ) => {
        keydetector.remove();
        canvas.clearRect(-1, -1, 2, 2);
        sizeArr.forEach((size, i) => {
            canvas.beginPath();
            canvas.arc(posXArr[i], posYArr[i], size, 0, 2 * Math.PI);
            canvas.fill();
        });
        fc(
            posXArr.map((p, i) => p + velXArr[i] * dt),
            posYArr.map((p, i) => p + velYArr[i] * dt),
        )((posXArr, posYArr) =>
        fc(
            velXArr.map((v, i) =>
                (v + ((i == 0) ? (accel[3] - accel[1]) * dt * accelRatio : 0))
                * (
                    Math.abs(posXArr[i]) > 1 - sizeArr[i] &&
                    Math.sign(v) == Math.sign(posXArr[i])
                ? -1 : 1)
            ),
            velYArr.map((v, i) =>
                (v + ((i == 0) ? (accel[2] - accel[0]) * dt * accelRatio : 0))
                * (
                    Math.abs(posYArr[i]) > 1 - sizeArr[i] &&
                    Math.sign(v) == Math.sign(posYArr[i])
                ? -1 : 1)
            ),
        )((velXArr, velYArr) =>
        fc(
            keydetector.cloneNode(true)
        )((keydetector) =>
        fc(
            (accel) => setTimeout(() => f(
                posXArr,
                posYArr,
                velXArr,
                velYArr,
                sizeArr,
                accel,
                tick + 1,
                lost,
                keydetector,
            ), Date.now() - startingTime - tick * 1000 / 60),
        )((next) =>
        fc(
            next(accel)
        )((nextTimeout) => {
        document.body.append(keydetector);
        keydetector.focus();
        keydetector.addEventListener("keyup", (e) =>
            fc(
                e.key === 'w' ? [0, accel[1], accel[2], accel[3]] :
                e.key === 'a' ? [accel[0], 0, accel[2], accel[3]] :
                e.key === 's' ? [accel[0], accel[1], 0, accel[3]] :
                e.key === 'd' ? [accel[0], accel[1], accel[2], 0] :
                undefined
            )((newAccel) => {
                if (newAccel !== undefined) {
                    clearTimeout(nextTimeout);
                    next(newAccel);
                }
            })
        );
        keydetector.addEventListener("keydown", (e) =>
            fc(
                e.key === 'w' ? [1, accel[1], accel[2], accel[3]] :
                e.key === 'a' ? [accel[0], 1, accel[2], accel[3]] :
                e.key === 's' ? [accel[0], accel[1], 1, accel[3]] :
                e.key === 'd' ? [accel[0], accel[1], accel[2], 1] :
                undefined
            )((newAccel) => {
                if (newAccel !== undefined) {
                    clearTimeout(nextTimeout);
                    next(newAccel);
                }
            })
        );
        })))));
    })
})(
    /* createArr */ (...x) => x
,   /* fc */ (...args) => (f) => f(...args)
,   /* fix */
    ((fix) => (...initialArgs) => (f) => f((...args) => fix(fix)(...args)(f), ...initialArgs))
    ((fix) => (...initialArgs) => (f) => f((...args) => fix(fix)(...args)(f), ...initialArgs))
,   /* canvas */ document.getElementById('canvas').getContext('2d')
,   /* size */ 500
,   1 / 60
,   /* startingTime */ Date.now()
,   /* accelRatio */ 0.3
);
