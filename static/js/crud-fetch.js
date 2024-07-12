const BASEURL = 'http://127.0.0.1:5000';

/**
 * Función para realizar una petición fetch con JSON.
 * @param {string} url - La URL a la que se realizará la petición.
 * @param {string} method - El método HTTP a usar (GET, POST, PUT, DELETE, etc.).
 * @param {Object} [data=null] - Los datos a enviar en el cuerpo de la petición.
 * @returns {Promise<Object>} - Una promesa que resuelve con la respuesta en formato JSON.
 */
async function fetchData(url, method, data = null) {
  const options = {
      method: method,
      headers: {
          'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,  // Si hay datos, los convierte a JSON y los incluye en el cuerpo
  };
  try {
    const response = await fetch(url, options);  // Realiza la petición fetch
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();  // Devuelve la respuesta en formato JSON
  } catch (error) {
    console.error('Fetch error:', error);
    alert('An error occurred while fetching data. Please try again.');
  }
}

/**
 * Funcion que permite crear un elemento <tr> para la tabla de peliculas
 * por medio del uso de template string de JS.
 */
async function showPaquetes(){
    let paquetes =  await fetchData(BASEURL+'/api/paquetes/', 'GET');
    const tablePaquetes = document.querySelector('#list-table-paquetes tbody');
    tablePaquetes.innerHTML='';
    paquetes.forEach((paquete, index) => {
      let tr = `<tr>
                    <td>${paquete.ciudad}</td>
                    <td>${paquete.dias}</td>
                    <td>${paquete.precio}</td>
                    <td>
                        <img src="${paquete.banner}" width="30%">
                    </td>
                    <td>
                        <button class="btn-cac" onclick='updatePaquete(${paquete.id_paquete})'><i class="fa fa-pencil" ></button></i>
                        <button class="btn-cac" onclick='deletePaquete(${paquete.id_paquete})'><i class="fa fa-trash" ></button></i>
                    </td>
                  </tr>`;
      tablePaquetes.insertAdjacentHTML("beforeend",tr);
    });
}

/**
 * Función para comunicarse con el servidor para poder Crear o Actualizar
 * un registro de un paquete
 * @returns 
 */
async function savePaquete(){
    const idPaquete = document.querySelector('#id-paquete').value;
    const ciudad = document.querySelector('#ciudad').value;
    const dias = document.querySelector('#dias').value;
    const precio = document.querySelector('#precio').value;
    const banner = document.querySelector('#banner-form').value;
    //VALIDACION DE FORMULARIO
    if (!ciudad || !dias || !precio || !banner) {
      Swal.fire({
          title: 'Error!',
          text: 'Por favor completa todos los campos.',
          icon: 'error',
          confirmButtonText: 'Cerrar'
      });
      return;
    }
    // Crea un objeto con los datos del paquete
    const paqueteData = {
        ciudad: ciudad,
        dias: dias,
        precio: precio,
        banner: banner,
    };
  let result = null;
  // Si hay un idMovie, realiza una petición PUT para actualizar el paquete existente
  if(idPaquete!==""){
    result = await fetchData(`${BASEURL}/api/paquetes/${idPaquete}`, 'PUT', paqueteData);
  }else{
    // Si no hay idMovie, realiza una petición POST para crear una nueva película
    result = await fetchData(`${BASEURL}/api/paquetes/`, 'POST', paqueteData);
  }
  
  const formPaquete= document.querySelector('#form-paquete');
  formPaquete.reset();
  Swal.fire({
    title: 'Exito!',
    text: result.message,
    icon: 'success',
    confirmButtonText: 'Cerrar'
  })
  showPaquetes();
}


/**
 * Function que permite eliminar una pelicula del array del localstorage
 * de acuedo al indice del mismo
 * @param {number} id posición del array que se va a eliminar
 */
function deletePaquete(id){
    Swal.fire({
        title: "Esta seguro de eliminar el paquete?",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
    }).then(async (result) => {
        if (result.isConfirmed) {
          let response = await fetchData(`${BASEURL}/api/paquetes/${id}`, 'DELETE');
          showPaquetes();
          Swal.fire(response.message, "", "success");
        }
    });
    
}

/**
 * Function que permite cargar el formulario con los datos de la pelicula 
 * para su edición
 * @param {number} id Id de la pelicula que se quiere editar
 */
async function updatePaquete(id){
    //Buscamos en el servidor la pelicula de acuerdo al id
    let response = await fetchData(`${BASEURL}/api/paquetes/${id}`, 'GET');
    const idPaquete = document.querySelector('#id-paquete');
    const ciudad = document.querySelector('#ciudad');
    const dias = document.querySelector('#dias');
    const precio = document.querySelector('#precio');
    const banner = document.querySelector('#banner-form');
    
    idPaquete.value = response.id_paquete;
    ciudad.value = response.ciudad;
    dias.value = response.dias;
    precio.value = response.precio;
    banner.value = response.banner;
}

// Escuchar el evento 'DOMContentLoaded' que se dispara cuando el 
// contenido del DOM ha sido completamente cargado y parseado.
document.addEventListener('DOMContentLoaded',function(){
    const btnSavePaquete = document.querySelector('#btn-save-paquete');
    // //ASOCIAR UNA FUNCION AL EVENTO CLICK DEL BOTON
    btnSavePaquete.addEventListener('click',savePaquete);
    showPaquetes();
});