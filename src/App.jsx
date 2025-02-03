import React, { useState } from 'react';

const SimulationApp = () => {

  // ! Aca definimos los hooks

  const [resultados, setResultados] = useState([]);
  const [meses, setMeses] = useState(12);
  const [rango, setRango] = useState({ inicio: 1, fin: 12 });
  const [precioPorUnidad, setPrecioPorUnidad] = useState(8);

  const [paginaActual, setPaginaActual] = useState(1);

  const [filasPorPagina] = useState(12);

  React.useEffect(() => {
    setRango((prevRango) => ({
      ...prevRango,
      fin: meses,
    }));
    setPaginaActual(1); 
  }, [meses]);

  const ejecutarSimulacion = () => {
    const resultadoSimulacion = simular(meses);
    setResultados([resultadoSimulacion]);
    setPaginaActual(1); 
  };

  const simular = (meses) => {

    // ! Definimos las constantes,  probabilidades y el valor de los datos inicales


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
      const unidadesDisponibles = stock + unidadesPedidas; //Este dato en si no se muestra en tabla pero me sirve para calcular el stock
      const unidadesVendidas = Math.min(demanda, unidadesDisponibles);
      stock = unidadesDisponibles - unidadesVendidas;

      const costoPedido = Q * costoPorDocena; //Cada docenas tiene un valor de $45
      const ingresos = unidadesVendidas * precioPorUnidad;
      const costoTotal = costoPedido + costoFijoMensual; //Lo que yo gasto en orden + un costo fijo mensual
      const ganancia = ingresos - costoTotal;

      gananciaTotal += ganancia;

      // ! Ahora simplemnte meto en el vecto los datos ordenados para luegos mostrarlos por tabla

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

      //Se pushea un objeto por cada iteracion y cada objeto representa una fila de la tabla

      const siguienteQ = Math.min(
        Math.max(Math.ceil(demanda / 12), pedidoMinimo),
        pedidoMaximo
      );
      Q = siguienteQ;
    }


    // ! Retorno un objeto con los datos que necesito para mostrar en la tabla, esto es lo mas importante, se retornan 3 cosas
    // ! La ganancia total, el promedio mensual y los detalles mensuales (Esta ultima es justamente la tabla)

    return {
      gananciaTotal: gananciaTotal.toFixed(2),
      gananciaPromedioMensual: (gananciaTotal / meses).toFixed(2),
      detallesMensuales,
    };
  };

  // ! Funciones de paginación

  const obtenerFilasPagina = (detalles) => { // Se toma como parametro de funcion un vector
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    return detalles.slice(inicio, fin); // retorna un vector sliceado segun paginas por fila
  };


  const totalPaginas = () => {
    const filasVisibles = rango.fin - rango.inicio + 1;
    return Math.ceil(filasVisibles / filasPorPagina); // retona un numero entero
  };

  {/* Entonces si setemos el useState de filas por pagina en 100, 
    tendiramos total de pag  =1000 / 100
    total de pag = 10
    
    */}

  return (

    <div className="p-6  rounded-lg shadow-md">

      <h1 className="text-2xl font-bold mb-4">Simulación de Inventarios</h1>
      

     {/* Input para modificar la cantidad de meses */}


      <div className="mb-4">
        
        <label className="block mb-2 font-semibold">Cantidad de meses:</label>
        <input
          type="number"
          className="p-2 border rounded w-fit"
          value={meses}
          onChange={(e) => setMeses(Number(e.target.value))}
        />
      </div>

       {/* Input para modificar el precio por unidad */}

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Precio por unidad:</label>
        <input
          type="number"
          className="p-2 border rounded w-fit"
          value={precioPorUnidad}
          onChange={(e) => setPrecioPorUnidad(Number(e.target.value))}
        />
      </div>



      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={ejecutarSimulacion}
      >
        Iniciar Simulación

      </button>

       {/* Renderizado condicional de la tabla */}

      {resultados.length > 0 && ( 
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultados:</h2>

          <div className="mb-4 flex gap-4">

            {/* Input para modificar el inicio del rango*/}
            <div>
              <label className="block mb-2 font-semibold">Inicio del rango:</label>
              <input
                type="number"
                className="p-2 border rounded w-full"
                value={rango.inicio}
                onChange={(e) => {
                  setRango({ ...rango, inicio: Number(e.target.value) });
                  setPaginaActual(1);
                }}
              />
            </div>


             {/* Input para modificar el fin del rango*/}

            <div>
              <label className="block mb-2 font-semibold">Fin del rango:</label>
              <input
                type="number"
                className="p-2 border rounded w-full"
                value={rango.fin}
                onChange={(e) => {
                  setRango({ ...rango, fin: Number(e.target.value) });
                  setPaginaActual(1);
                }}
                max={meses}
              />
            </div>


          </div>

          {/* A partir de ahora recien empezamos a iterar sobre el vector para mostrar los datos*/}

          {resultados.map((resultado, indiceSimulacion) => { //Este map es para recorrer el vector de resultados, en este caso solo hay 1 resultado

            const filasVisibles = resultado.detallesMensuales
              .slice(rango.inicio - 1, rango.fin);

              //Filas visibles es basicamente el resultado de la tabla acotado en limites osea el rango
            
            const paginasTotales = totalPaginas();

            return (

              <div key={indiceSimulacion} className="mb-4">

                <h3 className="text-lg font-semibold">Resultado</h3>

                <p>Ganancia Total: ${resultado.gananciaTotal}</p>
                <p>Promedio Mensual: ${resultado.gananciaPromedioMensual}</p>

                <div className="mt-4 flex items-center gap-4 mb-2">

                    {/* Boton para retroceder 1 pagina*/}

                  <button

                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}

                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Anterior

                  </button>
                  
                  <span className="text-sm">
                    Página {paginaActual} de {paginasTotales}
                  </span>

                  {/* Boton para avanzar 1 pagina*/}
                  
                  <button

                    onClick={() => setPaginaActual(p => Math.min(paginasTotales, p + 1))}
                    disabled={paginaActual === paginasTotales}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Siguiente
                    
                  </button>
                </div>

                <div className="overflow-auto max-h-[600px] border">

                  <table className="w-full text-sm text-left text-gray-500">

                    <thead className="text-gray-700 uppercase text-xs bg-gray-50">
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

                      {obtenerFilasPagina(filasVisibles).map((mes, indice) => (
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimulationApp;
