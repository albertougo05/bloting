// 
// Funcion Fetch para traer datos  (Revealing Module Pattern)
//

var fetchData = ( function () {

	const obtener = async endpoint => {
		let data = await (await fetch(endpoint)
								.catch(handleErr)
						 ).json();

		if (data.code && data.code == 400) {
			console.log('NO hay datos ...');
			return [];
		}

		return data;
	}

	const handleErr = function(err) {
		console.warn(err);
		let resp = new Response(
				JSON.stringify({
					code: 400,
					message: "Error de lectura en red !"
				})
		);

		return resp;
	}

    return {
        obtener: obtener,
    };

})();


export default fetchData;
