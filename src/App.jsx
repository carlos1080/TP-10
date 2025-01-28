import React, { useState } from 'react';

const SimulationApp = () => {

  const [results, setResults] = useState([]);
  const [months, setMonths] = useState(12); // Para la cantidad de meses
  const [range, setRange] = useState({ start: 1, end: 12 }); // Para el rango de iteraciones
  const [pricePerUnit, setPricePerUnit] = useState(8)

  React.useEffect(() => {
    setRange((prevRange) => ({
      ...prevRange,
      end: months, // Actualiza el final del rango al nuevo valor de months
    }));
  }, [months]); // Se ejecuta cada vez que months cambie
  

  const runSimulation = () => {
    const simulationResult = simulate(months);
    setResults([simulationResult]);
  };

  const simulate = (months) => {
    const costPerDozen = 45;
    const fixedMonthlyCost = 683.34;
    const minOrder = 30;
    const maxOrder = 50;

    const demands = [250, 300, 350, 400, 450, 500, 600];
    const probabilities = [0.3, 0.05, 0.2, 0.15, 0.1, 0.1, 0.1];
    const cumulativeProbabilities = probabilities.reduce((acc, prob, index) => {
      acc.push((acc[index - 1] || 0) + prob);
      return acc;
    }, []);

    let stock = 0;
    let Q = 30;
    let totalProfit = 0;
    const monthDetails = [];

    for (let month = 1; month <= months; month++) {
      const rnd = Math.random();
      const demand = demands[cumulativeProbabilities.findIndex((p) => rnd <= p)];
      const demandInDozens = demand / 12;

      const unitsOrdered = Q * 12;
      const totalUnitsAvailable = stock + unitsOrdered;
      const unitsSold = Math.min(demand, totalUnitsAvailable);
      stock = totalUnitsAvailable - unitsSold;

      const orderCost = Q * costPerDozen;
      const revenue = unitsSold * pricePerUnit;
      const totalCost = orderCost + fixedMonthlyCost;
      const profit = revenue - totalCost;

      totalProfit += profit;

      monthDetails.push({
        month,
        Q,
        unitsOrdered,
        rnd: rnd.toFixed(4),
        demand,
        demandInDozens: demandInDozens.toFixed(2),
        stock,
        Ko: orderCost.toFixed(2),
        Km: fixedMonthlyCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        revenue: revenue.toFixed(2),
        profit: profit.toFixed(2),
      });

      const nextQ = Math.min(
        Math.max(Math.ceil(demand / 12), minOrder),
        maxOrder
      );
      Q = nextQ;
    }

    return {

      totalProfit: totalProfit.toFixed(2),
      averageMonthlyProfit: (totalProfit / months).toFixed(2),
      monthDetails,
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simulación de Inventarios</h1>

      {/* Selección de cantidad de meses */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Cantidad de meses:</label>
        <input
          type="number"
          className="p-2 border rounded w-full"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))} 
        />
      </div>

      <div className="mb-4">

      <label className="block mb-2 font-semibold">Precio por unidad:</label>


        <input
         type="number"
         className="p-2 border rounded w-full" 
         value={pricePerUnit}
         onChange={(e) => setPricePerUnit(Number(e.target.value))} 
         />
         

      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={runSimulation}
      >
        Iniciar Simulación
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultados:</h2>

          {/* Selección del rango de iteraciones */}

          <div className="mb-4 flex gap-4">
            <div>
              <label className="block mb-2 font-semibold">Inicio del rango:</label>
              <input
                type="number"
                className="p-2 border rounded w-full"
                value={range.start}
                onChange={(e) => setRange({ ...range, start: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Fin del rango:</label>
              <input
                type="number"
                className="p-2 border rounded w-full"
                value={range.end}
                onChange={(e) => setRange({ ...range, end: Number(e.target.value) })}
                max={months}
              />
            </div>
          </div>

          {results.map((result, simIndex) => (
            <div key={simIndex} className="mb-4">
              <h3 className="text-lg font-semibold">Resultado</h3>
              <p>Ganancia Total: ${result.totalProfit}</p>
              <p>Promedio Mensual: ${result.averageMonthlyProfit}</p>
              <table className="w-full mt-4 text-sm text-left text-gray-500 border-collapse">
                <thead className="text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Mes</th>
                    <th className="px-4 py-2">Q (Docenas)</th>
                    <th className="px-4 py-2">Unidades Pedidas</th>
                    <th className="px-4 py-2">RND Demanda</th>
                    <th className="px-4 py-2">Demanda</th>
                    <th className="px-4 py-2">Demanda (Docenas)</th>
                    <th className="px-4 py-2">Stock (Unidades)</th>
                    <th className="px-4 py-2">Ko</th>
                    <th className="px-4 py-2">Km</th>
                    <th className="px-4 py-2">Costo Total</th>
                    <th className="px-4 py-2">Ganancia / Mes</th>
                    <th className="px-4 py-2">Beneficio Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthDetails

                  //Slice me devuelve el mismo array pero cortado desde un inicio hasta un fin segun yo le ponga
                    .slice(range.start - 1, range.end) 
                    .map((month, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                        >
                        <td className="px-4 py-2">{month.month}</td>
                        <td className="px-4 py-2">{month.Q}</td>
                        <td className="px-4 py-2">{month.unitsOrdered}</td>
                        <td className="px-4 py-2">{month.rnd}</td>
                        <td className="px-4 py-2">{month.demand}</td>
                        <td className="px-4 py-2">{month.demandInDozens}</td>
                        <td className="px-4 py-2">{month.stock}</td>
                        <td className="px-4 py-2">${month.Ko}</td>
                        <td className="px-4 py-2">${month.Km}</td>
                        <td className="px-4 py-2">${month.totalCost}</td>
                        <td className="px-4 py-2">${month.revenue}</td>
                        <td className="px-4 py-2">${month.profit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimulationApp;
