import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function PackageCollector({ onSelectPackage }) {
    const sceneRef = useRef(null);

    function applyFragilePhysics(body, fragile) {
        Matter.Body.setDensity(body, fragile ? 0.0005 : 0.002);
        body.restitution = fragile ? 0.6 : 0.2;
        body.friction = fragile ? 0.2 : 0.6;
    }

    function applyFragileVisual(body, fragile) {
        body.render.fillStyle = fragile ? '#f4a261' : '#d4a373';
        body.render.strokeStyle = fragile ? '#e63946' : null;
        body.render.lineWidth = fragile ? 4 : 0;
    }

    useEffect(() => {
        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events, Runner } = Matter;

        const savedPackages = JSON.parse(
            localStorage.getItem('packages') || '[]'
        );

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
                height,
            };

            applyFragilePhysics(box, box.packageData.fragile);
            applyFragileVisual(box, box.packageData.fragile);

            World.add(engine.world, box);
        }

        if (savedPackages.length) {
            savedPackages.forEach(pkg => spawnPackage(pkg));
        } else {
            for (let i = 0; i < 5; i++) rememberAndSpawn();
        }

        function rememberAndSpawn() {
            const temp = {};
            spawnPackage(temp);
            saveWorld();
        }

        function saveWorld() {
            const packages = engine.world.bodies
                .filter(b => b.packageData)
                .map(b => ({
                    ...b.packageData,
                    y: b.position.y
                }));
            
            localStorage.setItem('packages', JSON.stringify(packages));
        }

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2, render : { visible: false } }
        });

        World.add(engine.world, mouseConstraint);

        Events.on(mouseConstraint, 'mousedown', event => {
            const body = event.source.body;
            if (!body?.packageData) return;

            onSelectPackage(body.packageData);
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