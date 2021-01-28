'use strict';

/* Globals */
((
    createArr
,   fc /* Calls a function with arguments first. */
,   fix /* Fixedpoint functor. */
,   canvas /* The 2d context of the canvas. */
,   size /* The size of the canvas. */
,   ratio /* The ratio of the sizes to control line width. */
,   worldSize
,   zoomSize
,   accelRatio
,   drag
,   repulseFactor
,   superRechargeTime
,   sizeIncrease
) => {
    console.log(canvas);
    canvas.scale(size / 2 * ratio / zoomSize, size / 2 * ratio / zoomSize);
    canvas.translate(zoomSize / ratio, zoomSize / ratio);
    /* The 0th entity is the player */
    fix(
        /* posX */ createArr(0.0, 0.0, 0.7,-1.2, 4.0, 0.0, -1.9, 5.0, 0.0,  0.0),
        /* posY */ createArr(0.0, 5.0, 1.6, 0.4, 3.5, 6.0,-30.0, 1.8,10.0,-11.6),
        /* velX */ createArr(0.0, 2.7, 0.8,-0.5, 0.5, 0.7,  0.0, 0.1, 0.2,  0.0),
        /* velY */ createArr(0.0,0.18, 1.2, 1.3, 0.4, 0.3,  3.0, 0.0, 0.3, 0.02),
        /* size */ createArr(0.1,0.05, 0.3, 0.2, 0.4,0.32,  0.1, 1.4,0.24,  8.0),
        [0, 0, 0, 0],
        false,
        Date.now(),
        document.getElementById('keydetector'),
        0,
        false,
    )((
        f,
        posXArr,
        posYArr,
        velXArr,
        velYArr,
        sizeArr,
        accel,
        lost,
        lastTime,
        keydetector,
        lastSuperTime,
        isSuperActive,
    ) => {
        keydetector.remove();
        canvas.clearRect(-1 / ratio, -1 / ratio, 2 / ratio, 2 / ratio);
        sizeArr.forEach((size, i) => {
            canvas.beginPath();
            canvas.arc(posXArr[i] / ratio / worldSize, posYArr[i] / ratio / worldSize, size / ratio / worldSize, 0, 2 * Math.PI);
            if (i === 0) canvas.fill(); else canvas.stroke();
        });
        fc((Date.now() - lastTime) / 1000, Date.now())((dt, currentTime) =>
        fc(
            posXArr.map((p, i) => p + velXArr[i] * dt),
            posYArr.map((p, i) => p + velYArr[i] * dt),
        )((posXArr, posYArr) =>
        fc(
            velXArr.map((v, i) =>
                (v + (i === 0 && !lost ? (accel[3] - accel[1]) * dt * accelRatio : 0))
                * (
                    Math.abs(posXArr[i]) > worldSize - sizeArr[i] &&
                    Math.sign(v) == Math.sign(posXArr[i])
                ? -1 : 1) * (i === 0 ? drag ** dt : 1)
                + (isSuperActive && i !== 0 ? repulseFactor * (posXArr[i] - posXArr[0]) / ((posXArr[i] - posXArr[0]) ** 2 + (posYArr[i] - posYArr[0]) ** 2) / sizeArr[i]: 0)
            ),
            velYArr.map((v, i) =>
                (v + (i === 0 && !lost ? (accel[2] - accel[0]) * dt * accelRatio : 0))
                * (
                    Math.abs(posYArr[i]) > worldSize - sizeArr[i] &&
                    Math.sign(v) == Math.sign(posYArr[i])
                ? -1 : 1) * (i === 0 ? drag ** dt : 1)
                + (isSuperActive && i !== 0 ? repulseFactor * (posYArr[i] - posYArr[0]) / ((posXArr[i] - posXArr[0]) ** 2 + (posYArr[i] - posYArr[0]) ** 2) / sizeArr[i]: 0)
            ),
        )((velXArr, velYArr) =>
        fc(
            keydetector.cloneNode(true),
            sizeArr.some((x, i) => i !== 0 && (
                (posXArr[i] - posXArr[0]) ** 2 + (posYArr[i] - posYArr[0]) ** 2 < (x + sizeArr[0]) ** 2
            )),
            sizeArr.map((x, i) => i === 0 ? x + sizeIncrease * dt : x)
        )((keydetector, lostNow, sizeArr) =>
        fc(
            (accel, superNow) => f(
                posXArr,
                posYArr,
                velXArr,
                velYArr,
                sizeArr,
                accel,
                lost || lostNow,
                currentTime,
                keydetector,
                superNow ? Date.now() : lastSuperTime,
                superNow,
            ),
        )((next) => {
        if (lostNow && !lost) {
            document.getElementById('lost-wrapper').prepend(document.createElement('div'));
        }
        document.body.append(keydetector);
        keydetector.focus();
        keydetector.addEventListener('mousedown', (e) => {
            if (Date.now() - lastSuperTime > superRechargeTime && !lost && !lostNow)
                fc(setTimeout(() => {}, 0))(ti => {
                    clearTimeout(ti);
                    clearTimeout(ti - 1);
                    console.log('Using super');
                    next(accel, true);
                });
        });
        keydetector.addEventListener('keyup', (e) =>
            fc(
                e.key === 'w' ? [0, accel[1], accel[2], accel[3]] :
                e.key === 'a' ? [accel[0], 0, accel[2], accel[3]] :
                e.key === 's' ? [accel[0], accel[1], 0, accel[3]] :
                e.key === 'd' ? [accel[0], accel[1], accel[2], 0] :
                accel
            )((newAccel) => {
                if (JSON.stringify(newAccel) !== JSON.stringify(accel))
                    fc(setTimeout(() => {}, 0))(ti => {
                        clearTimeout(ti);
                        clearTimeout(ti - 1);
                        next(newAccel, false);
                    });
            })
        );
        keydetector.addEventListener('keydown', (e) =>
            fc(
                e.key === 'w' ? [1, accel[1], accel[2], accel[3]] :
                e.key === 'a' ? [accel[0], 1, accel[2], accel[3]] :
                e.key === 's' ? [accel[0], accel[1], 1, accel[3]] :
                e.key === 'd' ? [accel[0], accel[1], accel[2], 1] :
                accel
            )((newAccel) => {
                if (JSON.stringify(newAccel) !== JSON.stringify(accel))
                    fc(setTimeout(() => {}, 0))(ti => {
                        clearTimeout(ti);
                        clearTimeout(ti - 1);
                        next(newAccel, false);
                    });
            })
        );
        setTimeout(() => next(accel, false), currentTime + 1000 / 60 - Date.now());
        })))));
    })
})(
    /* createArr */ (...x) => x
,   /* fc */ (...args) => (f) => f(...args)
,   /* fix */
    ((fix) => (...initialArgs) => (f) => f((...args) => fix(fix)(...args)(f), ...initialArgs))
    ((fix) => (...initialArgs) => (f) => f((...args) => fix(fix)(...args)(f), ...initialArgs))
,   /* canvas */ document.getElementById('canvas').getContext('2d')
,   /* size */ 750
,   /* ratio */ 0.03
,   /* worldSize */ 2
,   /* zoomSize */ 1
,   /* accelRatio */ 2
,   /* drag */ 0.8
,   /* repulseFactor */ 0.1
,   /* superRechargeTime */ 1000 * 1
,   /* sizeIncrease */ 0.0005
);
