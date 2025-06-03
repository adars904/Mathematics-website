document.addEventListener('DOMContentLoaded', () => {
    const equationInput = document.getElementById('equation');
    const solveButton = document.getElementById('solveButton');
    const solutionDiv = document.getElementById('solution');
    const graphCanvas = document.getElementById('graphCanvas');
    const ctx = graphCanvas.getContext('2d');
    let myChart = null;
    const plotlyGraphDiv = document.getElementById('plotlyGraph');

    solveButton.addEventListener('click', () => {
        const rawInput = equationInput.value.trim();

        if (!rawInput) {
            solutionDiv.textContent = "Please enter an equation.";
            resetGraphs();
            return;
        }

        try {
            let equation = rawInput;
            let isImplicit = false;

            // Handle implicit equations (e.g., x^2 + y^2 = 1)
            if (equation.includes('=')) {
                const [lhs, rhs] = equation.split('=');
                equation = `(${lhs}) - (${rhs})`;
                isImplicit = true;
            }

            const is3D = equation.includes('x') && equation.includes('y');

            if (is3D) {
                // 3D Graph
                const xRange = [-5, 5];
                const yRange = [-5, 5];
                const xStep = 0.2;
                const yStep = 0.2;

                const xValues = [];
                const yValues = [];
                const zValues = [];

                for (let x = xRange[0]; x <= xRange[1]; x += xStep) {
                    const zRow = [];
                    xValues.push(x);
                    const yRow = [];
                    for (let y = yRange[0]; y <= yRange[1]; y += yStep) {
                        yRow.push(y);
                        try {
                            const expr = equation.replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
                            const z = math.evaluate(expr);
                            zRow.push(z);
                        } catch (err) {
                            zRow.push(null);
                        }
                    }
                    zValues.push(zRow);
                    if (yValues.length === 0) yValues.push(...yRow);
                }

                const data = [{
                    type: 'surface',
                    x: xValues,
                    y: yValues,
                    z: zValues
                }];

                const layout = {
                    title: `3D Graph of ${rawInput}`,
                    scene: {
                        xaxis: { title: 'X' },
                        yaxis: { title: 'Y' },
                        zaxis: { title: isImplicit ? 'f(x, y) = 0' : 'Z' }
                    }
                };

                Plotly.newPlot('plotlyGraph', data, layout);
                plotlyGraphDiv.style.display = 'block';
                graphCanvas.style.display = 'none';
                solutionDiv.textContent = isImplicit ? "Implicit equation plotted as f(x, y) = 0." : "3D function plotted.";

            } else {
                // 2D Graph
                const xValues = generateXValues(-10, 10, 0.1);
                const yValues = xValues.map(x => {
                    const expr = equation.replace(/x/g, `(${x})`);
                    return math.evaluate(expr);
                });

                if (myChart) myChart.destroy();

                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: xValues,
                        datasets: [{
                            label: rawInput,
                            data: yValues,
                            borderColor: 'blue',
                            borderWidth: 1,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            x: { type: 'linear', position: 'bottom' },
                            y: { type: 'linear', position: 'left' }
                        }
                    }
                });

                plotlyGraphDiv.style.display = 'none';
                graphCanvas.style.display = 'block';
                solutionDiv.textContent = "2D Function plotted.";
            }

        } catch (error) {
            solutionDiv.textContent = `Error: ${error.message}`;
            resetGraphs();
        }
    });

    function generateXValues(start, end, step) {
        const values = [];
        for (let i = start; i <= end; i += step) {
            values.push(i);
        }
        return values;
    }

    function resetGraphs() {
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
        plotlyGraphDiv.style.display = 'none';
        graphCanvas.style.display = 'block';
    }
});
