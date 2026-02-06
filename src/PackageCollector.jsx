import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function PackageCollector({ onSelectPackage }) {
    const sceneRef = useRef(null);

    useEffect(() => {
        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events, Runner } = Matter;

        const engine = Engine.create();
        engine.gravity.y = 1;
        
        const render = Render.create({
            element: sceneRef.current,
            engine,
            options: {
                width: 600,
                height: 480,
                wireframes: false,
                background: '#f5f5f5'
            }
        })

        const floor = Bodies.rectangle(300, 470, 600, 20, { isStatic: true });
        const leftWall = Bodies.rectangle(0, 240, 20, 480, { isStatic: true });
        const rightWall = Bodies.rectangle(600, 240, 20, 480, { isStatic: true });
        
        World.add(engine.world, [floor, leftWall, rightWall]);

        function spawnPackage(savedData) {
            const destinations = ['North', 'South', 'East', 'West'];

            const width = savedData?.width ?? (135 + Math.random() * 75);
            const height = savedData?.height ?? (135 + Math.random() * 75);

            const box = Bodies.rectangle(
                300 + Math.random() * 100 - 50, 0, width, height, { render: { fillStyle: '#d4a373' } }
            )

            box.packageData = {
                id: savedData?.id ?? crypto.randomUUID(),
                destination: savedData?.destination ?? destinations[Math.floor(Math.random() * destinations.length)],
                fragile: savedData?.fragile ?? false,
                width,
                height
            }

            World.add(engine.world, box);
        }

        for (let i = 0; i < 5; i++) {
            spawnPackage()
        }

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2, render : { visible: false } }
        });

        World.add(engine.world, mouseConstraint);

        Events.on(mouseConstraint, 'mousedown', event => {
            const body = event.source.body;

            if (body && body.packageData) {
                onSelectPackage(body.packageData);
                World.remove(engine.world, body);
            }
        })

        const runner = Runner.create();

        Runner.run(runner, engine);
        Render.run(render);
        
        return () => {
            Render.stop(render);
            Runner.stop(runner);
            World.clear(engine.world);
            Engine.clear(engine);  
        };
    }, [onSelectPackage]);

    return <div ref={sceneRef} />
}