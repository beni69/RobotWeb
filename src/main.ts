import "./style.css";
import "@fontsource/press-start-2p";
import { Robot } from "@kareszklub/roblib-client";

(async () => {
    const IP = prompt("Robot IP", "localhost")!;
    const robot = await Robot.connect(IP);

    const DELAY = 50;

    let speed = .5,
        moving = false;

    const speedSlider = document.getElementById("speed") as HTMLInputElement,
        // define the controls on the site.
        controls = {
            up: {
                element: document.getElementById("up"), // clickable html element
                keys: ["arrowup", "w", "k"], // keyboard shortcuts
                // function to run
                onPress: () => {
                    robot.drive(speed, speed);
                },
            },
            down: {
                element: document.getElementById("down"),
                keys: ["arrowdown", "s", "j"],
                onPress: () => {
                    robot.drive(speed * -1, speed * -1);
                },
            },
            left: {
                element: document.getElementById("left"),
                keys: ["arrowleft", "a", "h"],
                onPress: () => {
                    robot.drive(speed * -1, speed);
                },
            },
            right: {
                element: document.getElementById("right"),
                keys: ["arrowright", "d", "l"],
                onPress: () => {
                    robot.drive(speed, speed * -1);
                },
            },
            break: {
                element: document.getElementById("handbreak"),
                keys: [" "],
                onPress: () => {
                    robot.stop();
                },
            },
            LEDs: {
                element: document.getElementById("leds"),
                keys: ["q"],
                color: "turquoise", // button background color
                onPress: () => {
                    const r = !!Math.round(Math.random()),
                        g = !!Math.round(Math.random()),
                        b = !!Math.round(Math.random());
                    console.log({ r, g, b });
                    robot.led(r, g, b);
                },
            },
            horn: {
                element: document.getElementById("horn"),
                keys: ["e"],
                color: "turquoise",
                onPress: () => {
                    robot.buzzer(25);
                },
                // function to run when released
                onStop: () => {
                    robot.buzzer(100);
                    console.log("buzzer stopped");
                },
            },
        };

    speedSlider.onchange = () => setSpeed(speedSlider.value as any);

    // KEYBOARD CONTROLS

    // a key was pressed
    document.onkeydown = event => {
        console.log(event.key);

        // decide what to do based on what key was pressed
        const action = Object.values(controls).find(a =>
            a.keys.includes(event.key.toLowerCase())
        );

        // dont drive it already moving
        if (!action || (moving && action.keys[0] !== " ")) return;
        moving = true;

        action.onPress();
        action.element!.style.backgroundColor = "seagreen";
    };

    // a key was released
    document.onkeyup = event => {
        moving = false;

        const action = Object.values(controls).find(a =>
            a.keys.includes(event.key.toLowerCase())
        );

        if (!action) return;

        action.element!.style.backgroundColor =
            (action as any).color || "lightseagreen";

        // stop the robot
        setTimeout(() => {
            if (!moving) {
                (action as any).onStop?.() || robot.stop();
                console.log("stop");
            }
        }, DELAY);
    };

    // MOUSE AND TOUCH CONTROLS
    Object.values(controls).forEach(a => {
        const onDown = (e: Event) => {
            e.preventDefault();
            moving = true;
            a.onPress();
            a.element!.style.backgroundColor = "seagreen";
            console.log("click");
        };
        a.element!.onmousedown = onDown;
        a.element!.ontouchstart = onDown;

        const onUp = () => {
            moving = false;
            a.element!.style.backgroundColor =
                (a as any).color || "lightseagreen";
            setTimeout(() => {
                if (!moving) {
                    (a as any).onStop?.() || robot.stop();
                    console.log("stop");
                }
            }, DELAY);
        };
        a.element!.onmouseup = onUp;
        a.element!.ontouchend = onUp;
    });

    // set the slider when the speed changes
    function setSpeed(s: number) {
        speed = s / 100;
        speedSlider.value = s as any;
    }
    // change speed with the mouse wheel
    document.onwheel = event => {
        if (event.deltaY < 0) setSpeed(speed + 5);
        else if (event.deltaY > 0) setSpeed(speed - 5);
    };
})();
