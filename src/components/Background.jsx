import React, { useEffect } from 'react';

const Background = () => {
    useEffect(() => {
        // Neural network logic
        const createNeuralNetwork = () => {
            const container = document.getElementById('neural-network');
            if (!container || container.children.length > 0) return;

            // Create nodes
            for (let i = 0; i < 15; i++) {
                const node = document.createElement('div');
                node.className = 'neural-node';
                node.style.left = `${Math.random() * 100}%`;
                node.style.top = `${Math.random() * 100}%`;
                node.style.animationDelay = `${Math.random() * 2}s`;
                container.appendChild(node);
            }

            // Create connections
            setTimeout(() => {
                const nodes = document.querySelectorAll('.neural-node');
                nodes.forEach((node1, i) => {
                    nodes.forEach((node2, j) => {
                        if (i < j && Math.random() > 0.7) {
                            const rect1 = node1.getBoundingClientRect();
                            const rect2 = node2.getBoundingClientRect();

                            const x1 = rect1.left + rect1.width / 2;
                            const y1 = rect1.top + rect1.height / 2;
                            const x2 = rect2.left + rect2.width / 2;
                            const y2 = rect2.top + rect2.height / 2;

                            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                            const connection = document.createElement('div');
                            connection.className = 'neural-connection';
                            connection.style.width = `${length}px`;
                            connection.style.left = `${x1}px`;
                            connection.style.top = `${y1}px`;
                            connection.style.transform = `rotate(${angle}deg)`;
                            connection.style.opacity = '0.3';

                            container.appendChild(connection);
                        }
                    });
                });
            }, 100);
        };

        // Stars logic
        const createStars = () => {
            const container = document.getElementById('stars-container');
            if (!container || container.children.length > 0) return;

            // Create around 50 stars
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.width = `${Math.random() * 3}px`;
                star.style.height = star.style.width;
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                star.style.animationDelay = `${Math.random() * 5}s`;
                star.style.opacity = (Math.random() * 0.5 + 0.1).toString();
                container.appendChild(star);
            }
        };

        createNeuralNetwork();
        createStars();

        // Clean up
        return () => {
            const nnContainer = document.getElementById('neural-network');
            if (nnContainer) nnContainer.innerHTML = '';
            const starsContainer = document.getElementById('stars-container');
            if (starsContainer) starsContainer.innerHTML = '';
        }
    }, []);

    return (
        <>
            <div className="fixed inset-0 -z-10 pointer-events-none grid-pattern"></div>
            <div id="neural-network" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"></div>
            <div id="stars-container" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"></div>
        </>
    );
};

export default Background;
