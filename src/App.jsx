import React, { useState } from 'react';

const SimulationApp = () => {

  const [resultados, setResultados] = useState([]);
  const [meses, setMeses] = useState(12); // Para la cantidad de meses
  const [rango, setRango] = useState({ inicio: 1, fin: 12 }); // Para el rango de iteraciones
  const [precioPorUnidad, setPrecioPorUnidad] = useState(8)

  React.useEffect(() => {
    setRango((prevRango) => ({
      ...prevRango,
      fin: meses, // Actualiza el final del rango al nuevo valor de meses
    }));
  }, [meses]); // Se ejecuta cada vez que meses cambie
  

  const ejecutarSimulacion = () => {
    const resultadoSimulacion = simular(meses);
    setResultados([resultadoSimulacion]);
  };

  const simular = (meses) => {
    const costoPorDocena = 45;
    const costoFijoMensual = 683.34;
    const pedidoMinimo = 30;
    const pedidoMaximo = 50;

    const demandas = [250, 300, 350, 400, 450, 500, 600];
    const probabilidades = [0.3, 0.05, 0.2, 0.15, 0.1, 0.1, 0.1];
    const probabilidadesAcumuladas = probabilidades.reduce((acumulador, prob, indice) => {
      acumulador.push((acumulador[indice - 1] || 0) + prob);
      return acumulador;
    }, []);

    let stock = 0;
    let Q = 30;
    let gananciaTotal = 0;
    const detallesMensuales = [];

    for (let mes = 1; mes <= meses; mes++) {
      const aleatorio = Math.random();
      const demanda = demandas[probabilidadesAcumuladas.findIndex((p) => aleatorio <= p)];
      const demandaEnDocenas = demanda / 12;

      const unidadesPedidas = Q * 12;
      const unidadesDisponibles = stock + unidadesPedidas;
      const unidadesVendidas = Math.min(demanda, unidadesDisponibles);
      stock = unidadesDisponibles - unidadesVendidas;

      const costoPedido = Q * costoPorDocena;
      const ingresos = unidadesVendidas * precioPorUnidad;
      const costoTotal = costoPedido + costoFijoMensual;
      const ganancia = ingresos - costoTotal;

      gananciaTotal += ganancia;

      detallesMensuales.push({
        mes,
        Q,
        unidadesPedidas,
        aleatorio: aleatorio.toFixed(4),
        demanda,
        demandaEnDocenas: demandaEnDocenas.toFixed(2),
        stock,
        costoPedido: costoPedido.toFixed(2),
        costoFijoMensual: costoFijoMensual.toFixed(2),
        costoTotal: costoTotal.toFixed(2),
        ingresos: ingresos.toFixed(2),
        ganancia: ganancia.toFixed(2),
      });

      const siguienteQ = Math.min(
        Math.max(Math.ceil(demanda / 12), pedidoMinimo),
        pedidoMaximo
      );
      Q = siguienteQ;
    }

    return {
      gananciaTotal: gananciaTotal.toFixed(2),
      gananciaPromedioMensual: (gananciaTotal / meses).toFixed(2),
      detallesMensuales,
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
          value={meses}
          onChange={(e) => setMeses(Number(e.target.value))} 
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Precio por unidad:</label>
        <input
         type="number"
         className="p-2 border rounded w-full" 
         value={precioPorUnidad}
         onChange={(e) => setPrecioPorUnidad(Number(e.target.value))} 
         />
      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={ejecutarSimulacion}
      >
        Iniciar Simulación
      </button>

      {resultados.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultados:</h2>

          {/* Selección del rango de iteraciones */}
          <div className="mb-4 flex gap-4">
            <div>
              <label className="block mb-2 font-semibold">Inicio del rango:</label>
              <input
                type="number"
                className="p-2 border rounded w-full"
                value={rango.inicio}
                onChange={(e) => setRango({ ...rango, inicio: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Fin del rango:</label>
              <input
                type="number"
                className="p-2 border rounded w-full"
                value={rango.fin}
                onChange={(e) => setRango({ ...rango, fin: Number(e.target.value) })}
                max={meses}
              />
            </div>
          </div>

          {resultados.map((resultado, indiceSimulacion) => (
            <div key={indiceSimulacion} className="mb-4">
              <h3 className="text-lg font-semibold">Resultado</h3>
              <p>Ganancia Total: ${resultado.gananciaTotal}</p>
              <p>Promedio Mensual: ${resultado.gananciaPromedioMensual}</p>
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
                    <th className="px-4 py-2">Costo Pedido</th>
                    <th className="px-4 py-2">Costo Fijo Mensual</th>
                    <th className="px-4 py-2">Costo Total</th>
                    <th className="px-4 py-2">Ingresos</th>
                    <th className="px-4 py-2">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.detallesMensuales
                    .slice(rango.inicio - 1, rango.fin) 
                    .map((mes, indice) => (
                      <tr
                        key={indice}
                        className={`${indice % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                        >
                        <td className="px-4 py-2">{mes.mes}</td>
                        <td className="px-4 py-2">{mes.Q}</td>
                        <td className="px-4 py-2">{mes.unidadesPedidas}</td>
                        <td className="px-4 py-2">{mes.aleatorio}</td>
                        <td className="px-4 py-2">{mes.demanda}</td>
                        <td className="px-4 py-2">{mes.demandaEnDocenas}</td>
                        <td className="px-4 py-2">{mes.stock}</td>
                        <td className="px-4 py-2">${mes.costoPedido}</td>
                        <td className="px-4 py-2">${mes.costoFijoMensual}</td>
                        <td className="px-4 py-2">${mes.costoTotal}</td>
                        <td className="px-4 py-2">${mes.ingresos}</td>
                        <td className="px-4 py-2">${mes.ganancia}</td>
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
