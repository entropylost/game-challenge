'use strict';

/* Globals */
((
    createArr
,   fc /* Calls a function with arguments first. */
,   fix /* Fixedpoint functor. */
,   canvas /* The 2d context of the canvas. */
,   size /* The size of the canvas. */
,   ratio /* The ratio of the sizes to control line width. */
,   accelRatio
) => {
    console.log(canvas);
    canvas.scale(size / 2 * ratio, size / 2 * ratio);
    canvas.translate(1 / ratio, 1 / ratio);
    /* The 0th entity is the player */
    fix(
        createArr(0, 0.2),
        createArr(0, -0.3),
        createArr(0.2, 0.1),
        createArr(0.15, -0.3),
        createArr(0.1, 0.2),
        [0, 0, 0, 0],
        Date.now(),
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
        lastTime,
        lost,
        keydetector,
    ) => {
        keydetector.remove();
        canvas.clearRect(-1 / ratio, -1 / ratio, 2 / ratio, 2 / ratio);
        sizeArr.forEach((size, i) => {
            canvas.beginPath();
            canvas.arc(posXArr[i] / ratio, posYArr[i] / ratio, size / ratio, 0, 2 * Math.PI);
            if (i === 0) canvas.fill(); else canvas.stroke();
        });
        fc((Date.now() - lastTime) / 1000, Date.now())((dt, currentTime) =>
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
            (accel) => f(
                posXArr,
                posYArr,
                velXArr,
                velYArr,
                sizeArr,
                accel,
                currentTime,
                lost,
                keydetector,
            ),
        )((next) => {
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
                if (newAccel !== undefined)
                    fc(setTimeout(() => {}, 0))(ti => {
                        clearTimeout(ti);
                        clearTimeout(ti - 1);
                        next(newAccel);
                    });
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
                if (newAccel !== undefined)
                    fc(setTimeout(() => {}, 0))(ti => {
                        clearTimeout(ti);
                        clearTimeout(ti - 1);
                        next(newAccel);
                    });
            })
        );
        setTimeout(() => next(accel), currentTime + 1000 / 60 - Date.now());
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
,   /* ratio */ 0.05
,   /* accelRatio */ 1
);
