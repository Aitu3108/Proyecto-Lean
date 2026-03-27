// Lista estándar de cortes de una media res vacuna (Sincronizada con Excel del usuario)
            const cortes = [
                "BIFE ANCHO XKG", "ROAST BEEF XKG", "TAPA PARRILLERA XKG", "ASADO DE ORILLA XKG",
                "TORTUGUITA XKG", "TAPA DE NALGA XKG", "CARNAZA COMUN XKG", "AZOTILLO XKG",
                "PICADA 1° CALIDAD XKG", "VACIO XKG", "MATAMBRE XKG", "ENTRAÑA XKG",
                "OSOBUCO / CHIQUIZUELA XKG", "ESPINAZO XKG", "PALETA XKG", "PALOMITA XKG",
                "CUADRIL XKG", "PECETO XKG", "COLITA DE CUADRIL XKG", "BIFE C/LOMO ESPECIAL XKG",
                "LOMO XKG", "BOLA DE LOMO XKG", "NALGA XKG", "CUADRADA XKG", "BIFE ANGOSTO XKG",
                "HUESO FALDA XKG", "PICADA ESPECIAL XKG", "SEBO XKG", "CABEZA DE LOMO XKG",
                "ARAÑITAS XKG", "FALDA PARRILLERA XKG", "PRODUCCION CARNE", "ASADO AMERICANO XKG",
                "TAPA DE ASADO XKG", "ASADO ENTERO XKG", "DECOMISO XKG"
            ];

            const gridView = document.getElementById('gridView');
            const tableBody = document.getElementById('tableBody');
            const cantidadMediasInput = document.getElementById('cantidadMedias');
            const pesoTotalInput = document.getElementById('pesoTotal');

            function toggleSidebar() {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.toggle('open');
            }


            let cutIndex = 0;

            function agregarCorteDOM(corteNombre, isManual = false) {
                const id = `corte_${cutIndex}`;
                cutIndex++;

                // Para la vista en cuadrícula
                const div = document.createElement('div');
                div.className = 'cut-item';
                div.id = `item_${id}`;

                let deleteBtnGrid = '';
                let deleteBtnTable = '';

                if (isManual) {
                    deleteBtnGrid = `<button class="btn-delete" onclick="eliminarCorte('${id}')" title="Quitar este concepto">✖</button>`;
                    deleteBtnTable = `<button class="btn-delete" onclick="eliminarCorte('${id}')" title="Quitar este concepto" style="float: right;">✖</button>`;
                }

                div.innerHTML = `
                <div class="cut-item-header">
                    <label for="${id}">${corteNombre}</label>
                    ${deleteBtnGrid}
                </div>
                <input type="number" id="${id}" class="cut-input" step="0.1" min="0" placeholder="0.0">
                <div class="percentage" id="perc_${id}"></div>
                <div class="price-inputs">
                    <label>Precio Costo</label>
                    <input type="number" id="costo_${id}" class="costo-input" step="1" min="0" placeholder="$0.00">
                    <label>Precio Venta</label>
                    <input type="number" id="venta_${id}" class="venta-input" step="1" min="0" placeholder="$0.00">
                </div>
            `;
                gridView.appendChild(div);

                // Para la vista en tabla
                const tr = document.createElement('tr');
                tr.id = `row_${id}`;
                tr.innerHTML = `
                <td>${corteNombre} ${deleteBtnTable}</td>
                <td><input type="number" id="table_${id}" class="cut-input-table" data-target="${id}" step="0.1" min="0" placeholder="0.0"></td>
                <td><input type="number" id="table_costo_${id}" class="costo-input-table" data-target="costo_${id}" step="1" min="0" placeholder="$0.00" style="width:80px"></td>
                <td><input type="number" id="table_venta_${id}" class="venta-input-table" data-target="venta_${id}" step="1" min="0" placeholder="$0.00" style="width:80px"></td>
                <td id="table_prom_${id}" style="color: var(--primary); font-weight: bold; font-size: 14px;">$0.00</td>
                <td id="table_perc_${id}" style="color: var(--text-muted); font-size: 14px;">0.00%</td>
            `;
                tableBody.appendChild(tr);

                const gridInput = document.getElementById(id);
                const tabInput = document.getElementById(`table_${id}`);
                const costoGridInput = document.getElementById(`costo_${id}`);
                const costoTabInput = document.getElementById(`table_costo_${id}`);
                const ventaGridInput = document.getElementById(`venta_${id}`);
                const ventaTabInput = document.getElementById(`table_venta_${id}`);

                gridInput.addEventListener('input', () => {
                    tabInput.value = gridInput.value;
                    calcularTotales();
                });

                tabInput.addEventListener('input', () => {
                    gridInput.value = tabInput.value;
                    calcularTotales();
                });

                costoGridInput.addEventListener('input', () => {
                    costoTabInput.value = costoGridInput.value;
                    calcularTotales();
                });

                costoTabInput.addEventListener('input', () => {
                    costoGridInput.value = costoTabInput.value;
                    calcularTotales();
                });

                ventaGridInput.addEventListener('input', () => {
                    ventaTabInput.value = ventaGridInput.value;
                    calcularTotales();
                });

                ventaTabInput.addEventListener('input', () => {
                    ventaGridInput.value = ventaTabInput.value;
                    calcularTotales();
                });
            }

            // Inicializar cortes estándar
            cortes.forEach(corte => agregarCorteDOM(corte));

            function agregarConcepto() {
                const inputNombre = document.getElementById('nuevoCorteNombre');
                const nombre = inputNombre.value.trim();
                if (nombre) {
                    agregarCorteDOM(nombre, true);
                    inputNombre.value = '';
                } else {
                    alert('Por favor introduzca un nombre para el concepto.');
                }
            }

            function eliminarCorte(id) {
                const itemGrid = document.getElementById(`item_${id}`);
                const itemTable = document.getElementById(`row_${id}`);
                if (itemGrid) itemGrid.remove();
                if (itemTable) itemTable.remove();
                calcularTotales();
            }

            // Permitir usar Enter en el input de concepto
            const nuevoCorteInput = document.getElementById('nuevoCorteNombre');
            if (nuevoCorteInput) {
                nuevoCorteInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        agregarConcepto();
                    }
                });
            }

            cantidadMediasInput.addEventListener('input', calcularTotales);
            pesoTotalInput.addEventListener('input', calcularTotales);

            function toggleView(view) {
                const btnGrid = document.getElementById('btnGrid');
                const btnTable = document.getElementById('btnTable');
                const grid = document.getElementById('gridView');
                const table = document.getElementById('tableView');

                if (view === 'grid') {
                    btnGrid.classList.add('active');
                    btnTable.classList.remove('active');
                    grid.style.display = 'grid';
                    table.style.display = 'none';
                } else {
                    btnTable.classList.add('active');
                    btnGrid.classList.remove('active');
                    table.style.display = 'table';
                    grid.style.display = 'none';
                }
            }

            function calcularTotales() {
                let totalKg = 0;
                const pesoTotal = parseFloat(pesoTotalInput.value) || 0;
                const cantidadMedias = parseInt(cantidadMediasInput.value) || 1;

                const currentInputs = document.querySelectorAll('.cut-input');
                let costoTotalGlobal = 0;
                let ingresoTotalGlobal = 0;
                let totalSebo = 0;
                let totalHueso = 0;
                let totalDecomiso = 0;

                // Calcular suma de cortes y costos individuales
                currentInputs.forEach(input => {
                    const kg = parseFloat(input.value) || 0;
                    totalKg += kg;

                    const id = input.id;
                    const labelNode = document.querySelector(`label[for="${id}"]`);
                    const name = labelNode ? labelNode.innerText.toUpperCase() : '';

                    if (name.includes('SEBO')) totalSebo += kg;
                    else if (name.includes('HUESO') && !name.includes('FALDA')) totalHueso += kg;
                    else if (name.includes('DECOMISO')) totalDecomiso += kg;

                    const costoItem = parseFloat(document.getElementById(`costo_${id}`).value) || 0;
                    const ventaItem = parseFloat(document.getElementById(`venta_${id}`).value) || 0;

                    costoTotalGlobal += (kg * costoItem);
                    ingresoTotalGlobal += (kg * ventaItem);
                });

                // Actualizar porcentajes individuales
                currentInputs.forEach(input => {
                    const kg = parseFloat(input.value) || 0;
                    let percText = "";
                    let percValue = 0;

                    if (pesoTotal > 0 && kg > 0) {
                        percValue = (kg / pesoTotal) * 100;
                        percText = percValue.toFixed(2) + "% del total";
                    }

                    document.getElementById(`perc_${input.id}`).innerText = percText;
                    
                    const tablePercEl = document.getElementById(`table_perc_${input.id}`);
                    if (tablePercEl) {
                        tablePercEl.innerText = percText || "0.00%";
                    }

                    // Calcular y actualizar Venta Promedio / Kg en la tabla
                    const ventaItem = parseFloat(document.getElementById(`venta_${input.id}`).value) || 0;
                    const promColEl = document.getElementById(`table_prom_${input.id}`);
                    if (promColEl) {
                        let promVenta = 0;
                        if (kg > 0) {
                            promVenta = (kg * ventaItem) / kg; // Equivale a ventaItem en este contexto donde es /kg
                        } else {
                            promVenta = ventaItem; // Si no hay kgs cargados, muestra el precio de venta ingresado
                        }
                        promColEl.innerText = "$" + promVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                });
                
                // Actualizar cortes faticos (si los hay y tienen campos de venta promedio, pero por ahora solo dinámicos)

                // Object.keys(staticCutsValues).forEach(scId => {      }); // This line was commented out in the original, keeping it commented.

                // Actualizar resúmenes
                let kgPromedioMedia = cantidadMedias > 0 ? pesoTotal / cantidadMedias : 0;
                const kgPromedioEl = document.getElementById('kgPromedioMedia');
                if (kgPromedioEl) kgPromedioEl.innerText = kgPromedioMedia.toFixed(2) + " kg";

                document.getElementById('totalkg').innerText = totalKg.toFixed(2) + " kg";

                const merma = pesoTotal - totalKg;
                let pctMerma = pesoTotal > 0 ? (merma / pesoTotal) * 100 : 0;
                document.getElementById('merma').innerText = pesoTotal > 0 ? `${merma.toFixed(2)} kg (${pctMerma.toFixed(2)}%)` : "0.00 kg";

                let rendimiento = 0;
                if (pesoTotal > 0) {
                    // El rendimiento global excluye el concepto sebo y hueso.
                    // El decomiso se resta doble para descontar su propio peso y además reducir el rendimiento final como penalización (merma no útil).
                    let kgRendimiento = totalKg - totalSebo - totalHueso - (totalDecomiso * 2);
                    rendimiento = (kgRendimiento / pesoTotal) * 100;
                    document.getElementById('rendimiento').innerText = rendimiento.toFixed(2) + "%";
                } else {
                    document.getElementById('rendimiento').innerText = "0%";
                }

                // Advertencia si los cortes superan el peso
                const warningMsg = document.getElementById('warningMsg');
                if (pesoTotal > 0 && totalKg > pesoTotal) {
                    warningMsg.style.display = 'block';
                } else {
                    warningMsg.style.display = 'none';
                }

                // Sebo y Hueso update
                const rowSebo = document.getElementById('rowSebo');
                if (totalSebo > 0) {
                    if(rowSebo) rowSebo.style.display = 'flex';
                    let pct = pesoTotal > 0 ? (totalSebo / pesoTotal) * 100 : 0;
                    document.getElementById('totalsebo').innerText = `${totalSebo.toFixed(2)} kg (${pct.toFixed(2)}%)`;
                } else {
                    if(rowSebo) rowSebo.style.display = 'none';
                }

                const rowHueso = document.getElementById('rowHueso');
                if (totalHueso > 0) {
                    if(rowHueso) rowHueso.style.display = 'flex';
                    let pct = pesoTotal > 0 ? (totalHueso / pesoTotal) * 100 : 0;
                    document.getElementById('totalhueso').innerText = `${totalHueso.toFixed(2)} kg (${pct.toFixed(2)}%)`;
                } else {
                    if(rowHueso) rowHueso.style.display = 'none';
                }

                const rowDecomiso = document.getElementById('rowDecomiso');
                if (totalDecomiso > 0) {
                    if(rowDecomiso) rowDecomiso.style.display = 'flex';
                    let pct = pesoTotal > 0 ? (totalDecomiso / pesoTotal) * 100 : 0;
                    document.getElementById('totaldecomiso').innerText = `${totalDecomiso.toFixed(2)} kg (${pct.toFixed(2)}%)`;
                } else {
                    if(rowDecomiso) rowDecomiso.style.display = 'none';
                }

                const rowMarkup = document.getElementById('rowMarkup');
                if (costoTotalGlobal > 0 && ingresoTotalGlobal > 0) {
                    let markUp = ((ingresoTotalGlobal - costoTotalGlobal) / costoTotalGlobal) * 100;
                    if(rowMarkup) rowMarkup.classList.remove('hidden');
                    document.getElementById('markupGlobal').innerText = markUp.toFixed(2) + "%";
                } else {
                    if(rowMarkup) rowMarkup.classList.add('hidden');
                }

                // Cálculos de costos e ingresos combinados
                const rowCostoTotal = document.getElementById('rowCostoTotal');
                const rowIngresoTotal = document.getElementById('rowIngresoTotal');
                const rowGanancia = document.getElementById('rowGanancia');
                const rowGananciaKg = document.getElementById('rowGananciaKg');
                const rowCostoPromedio = document.getElementById('rowCostoPromedio');

                if (costoTotalGlobal > 0 || ingresoTotalGlobal > 0) {
                    rowCostoTotal.classList.remove('hidden');
                    if (rowCostoPromedio) rowCostoPromedio.classList.remove('hidden');

                    document.getElementById('costoTotal').innerText = "$" + costoTotalGlobal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    if (ingresoTotalGlobal > 0) {
                        const ganancia = ingresoTotalGlobal - costoTotalGlobal;

                        rowIngresoTotal.classList.remove('hidden');
                        rowGanancia.classList.remove('hidden');
                        if (rowGananciaKg) rowGananciaKg.classList.remove('hidden');

                        document.getElementById('ingresoTotal').innerText = "$" + ingresoTotalGlobal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        document.getElementById('gananciaTotal').innerText = "$" + ganancia.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        document.getElementById('gananciaTotal').style.color = ganancia >= 0 ? 'var(--success)' : 'var(--danger)';
                        
                        let gananciaPromedio = 0;
                        if (pesoTotal > 0) {
                            gananciaPromedio = ingresoTotalGlobal / pesoTotal;
                        }
                        const gananciaKgEl = document.getElementById('gananciaKgTotal');
                        if (gananciaKgEl) {
                            gananciaKgEl.innerText = "$" + gananciaPromedio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            gananciaKgEl.style.color = gananciaPromedio >= 0 ? 'var(--success)' : 'var(--danger)';
                        }
                    } else {
                        rowIngresoTotal.classList.add('hidden');
                        rowGanancia.classList.add('hidden');
                        if (rowGananciaKg) rowGananciaKg.classList.add('hidden');
                    }

                    let kgUtiles = totalKg;
                    let costoPromedio = 0;
                    if (kgUtiles > 0) {
                        costoPromedio = costoTotalGlobal / kgUtiles;
                    }

                    document.getElementById('costoPromedio').innerText = "$" + costoPromedio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                } else {
                    rowCostoTotal.classList.add('hidden');
                    if (rowCostoPromedio) rowCostoPromedio.classList.add('hidden');
                    rowIngresoTotal.classList.add('hidden');
                    rowGanancia.classList.add('hidden');
                    if (rowGananciaKg) rowGananciaKg.classList.add('hidden');
                }

            }

            let currentReportId = null;
            let currentReportName = "Desglose de hoy";

            function limpiarDatos(force = false) {
                if (force || confirm('¿Estás seguro de querer limpiar todos los datos?')) {
                    cantidadMediasInput.value = '1';
                    pesoTotalInput.value = '';
                    
                    const currentInputs = document.querySelectorAll('.cut-input');
                    const costoInputs = document.querySelectorAll('.costo-input');
                    const ventaInputs = document.querySelectorAll('.venta-input');

                    currentInputs.forEach(input => {
                        input.value = '';
                        const targetTableInput = document.getElementById(`table_${input.id}`);
                        if (targetTableInput) targetTableInput.value = '';
                    });

                    costoInputs.forEach(input => {
                        input.value = '';
                        const targetTableInput = document.getElementById(`table_${input.id}`);
                        if (targetTableInput) targetTableInput.value = '';
                    });

                    ventaInputs.forEach(input => {
                        input.value = '';
                        const targetTableInput = document.getElementById(`table_${input.id}`);
                        if (targetTableInput) targetTableInput.value = '';
                    });

                    currentReportId = null;
                    currentReportName = "Desglose de hoy";

                    calcularTotales();
                    window.scrollTo(0, 0);
                }
            }

            function enviarPorEmail() {
                const pesoTotal = parseFloat(pesoTotalInput.value) || 0;
                const cantidadMedias = parseInt(cantidadMediasInput.value) || 1;

                let body = `Desglose de Media Res\n`;
                body += `======================\n\n`;
                body += `Cant. de Medias Despostadas: ${cantidadMedias}\n`;
                body += `Total Kg Despostados: ${pesoTotal.toFixed(2)} kg\n`;

                body += `\nDetalle de Cortes:\n`;
                body += `------------------\n`;

                let hasCuts = false;
                let costoTotalGlobal = 0;
                let ingresoTotalGlobal = 0;

                const gridItems = document.querySelectorAll('.cut-item, .static-cut-item');

                gridItems.forEach(item => {
                    const labelNode = item.querySelector('.cut-item-header label, .static-cut-header');
                    const label = labelNode ? labelNode.innerText : 'Corte Desconocido';
                    const cleanLabel = label.replace('✖', '').trim();
                    const input = item.querySelector('.cut-input');
                    const kg = parseFloat(input.value) || 0;

                    const costoInput = item.querySelector('.costo-input');
                    const ventaInput = item.querySelector('.venta-input');
                    const costoPrecio = parseFloat(costoInput.value) || 0;
                    const ventaPrecio = parseFloat(ventaInput.value) || 0;

                    if (kg > 0) {
                        costoTotalGlobal += (kg * costoPrecio);
                        ingresoTotalGlobal += (kg * ventaPrecio);

                        const percentageEl = item.querySelector('.percentage');
                        const percText = percentageEl ? percentageEl.innerText.replace(' del total', '') : '';
                        body += `- ${cleanLabel}: ${kg.toFixed(2)} kg ${percText ? `(${percText})` : ''}\n`;
                        if (costoPrecio > 0 || ventaPrecio > 0) {
                            body += `  > `;
                            if (costoPrecio > 0) body += `Costo $${costoPrecio}/kg `;
                            if (ventaPrecio > 0) body += `Venta $${ventaPrecio}/kg `;
                            body += `\n`;
                        }
                        hasCuts = true;
                    }
                });

                if (!hasCuts) {
                    body += `Sin cortes registrados.\n`;
                }

                body += `\nResumen:\n`;
                body += `--------\n`;
                body += `Total de Cortes: ${document.getElementById('totalkg').innerText}\n`;
                body += `Merma / Diferencia: ${document.getElementById('merma').innerText}\n`;
                body += `Rendimiento Global: ${document.getElementById('rendimiento').innerText}\n`;

                if (costoTotalGlobal > 0 || ingresoTotalGlobal > 0) {
                    body += `\nCosto Total: ${document.getElementById('costoTotal').innerText}\n`;
                    if (ingresoTotalGlobal > 0) {
                        body += `Ingreso Total Estimado: ${document.getElementById('ingresoTotal').innerText}\n`;
                        body += `Ganancia Neta Estimada: ${document.getElementById('gananciaTotal').innerText}\n`;
                    }
                    body += `Costo Promedio por Kg Útil: ${document.getElementById('costoPromedio').innerText}\n`;
                }

                const subject = encodeURIComponent("Reporte Desglose de Media Res");
                const mailtoLink = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;

                window.location.href = mailtoLink;
            }

            // --- Tabs Feature ---
            function switchTab(tabId) {
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

                document.getElementById(tabId).classList.add('active');
                if(event && event.currentTarget) {
                    event.currentTarget.classList.add('active');
                }


                if (tabId === 'savedTb') {
                    renderSavedItems();
                }
                if (tabId === 'summaryTb') {
                    if (desglosesMemoria.length === 0) renderSavedItems(); // fetch if empty
                    else switchResumenView(currentResumenView); // render UI
                }
                if (tabId === 'adminTb') {
                    if (desglosesMemoria.length === 0) renderSavedItems().then(renderAdminMonitor);
                    else renderAdminMonitor();
                }
            }

            // --- Auth flow ---
            let desglosesMemoria = [];
            let currentUserRole = 'user';

            async function login() {
                const u = document.getElementById('loginUser').value;
                const p = document.getElementById('loginPass').value;

                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: u, password: p })
                    });

                    const data = await response.json();

                    if (data.success) {
                        document.getElementById('loginModal').style.display = 'none';
                        document.getElementById('mainContainer').style.display = 'block';
                        document.getElementById('userGreeting').innerText = data.username;
                        currentUserRole = data.role;
                        const badge = document.getElementById('userRoleBadge');
                        if (badge) {
                            badge.innerText = currentUserRole === 'admin' ? 'Administrador' : 'Operador';
                            badge.className = currentUserRole === 'admin' ? 'user-role badge badge-admin' : 'user-role badge badge-user';
                        }


                        if (currentUserRole === 'admin') {
                            document.getElementById('adminTabBtn').style.display = 'inline-block';
                            iniciarMonitorConstante();
                        }
                        iniciarRastreadorInactividad();
                        renderSavedItems();
                    } else {
                        alert("Usuario o contraseña incorrectos");
                    }
                } catch (e) {
                    alert("Error de conexión con el servidor");
                }
            }

            async function cerrarSesion() {
                await fetch('/api/logout', { method: 'POST' });
                location.reload();
            }

            window.onload = async () => {
                const res = await fetch('/api/check-session');
                const data = await res.json();
                if (data.loggedIn) {
                    currentUserRole = data.role;
                    document.getElementById('loginModal').style.display = 'none';
                    document.getElementById('mainContainer').style.display = 'block';
                    document.getElementById('userGreeting').innerText = data.user;
                    const badge = document.getElementById('userRoleBadge');
                    if (badge) {
                        badge.innerText = currentUserRole === 'admin' ? 'Administrador' : 'Operador';
                        badge.className = currentUserRole === 'admin' ? 'user-role badge badge-admin' : 'user-role badge badge-user';
                    }


                    if (currentUserRole === 'admin') {
                        document.getElementById('adminTabBtn').style.display = 'inline-block';
                        iniciarMonitorConstante();
                    }
                    iniciarRastreadorInactividad();
                    renderSavedItems();
                } else {
                    document.getElementById('loginModal').style.display = 'flex';
                    document.getElementById('mainContainer').style.display = 'none';
                }
            };
            
            // --- Monitor de Seguridad por Inactividad ---
            let timeoutId;
            const MAX_INACT_MS = 60000; // 60 segundos exactos

            function iniciarRastreadorInactividad() {
                // Configurar eventos globales de captura
                document.onmousemove = resetTimer;
                document.onkeypress = resetTimer;
                document.ontouchstart = resetTimer; 
                document.onclick = resetTimer;      
                document.onscroll = resetTimer;    

                function desloguearPorInactividad() {
                    fetch('/api/logout', { method: 'POST' }).then(() => {
                        // Forzar purga visual en el frontend instantáneamente por seguridad visual
                        document.getElementById('mainContainer').style.display = 'none';
                        document.getElementById('loginModal').style.display = 'flex';
                        document.getElementById('logoutMsg').style.display = 'block'; // Elemento previamente agregado
                        
                        // Purga local en memoria
                        desglosesMemoria = [];
                        document.getElementById('tableBody').innerHTML = '';
                        document.getElementById('gridView').innerHTML = '';
                    });
                }

                function resetTimer() {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(desloguearPorInactividad, MAX_INACT_MS);
                }
                
                resetTimer(); // Iniciar cuenta regresiva inicial
            }

            function iniciarMonitorConstante() {
                // Monitoreo constante (Polling). Refresca la vista si el admin está viendo el panel
                setInterval(() => {
                    if (document.getElementById('adminTb').classList.contains('active')) {
                        // Trae info del servidor callado y actualiza
                        renderSavedItems().then(renderAdminMonitor);
                    }
                }, 10000); // 10 Segundos
            }

            // --- Lógica del Importador Excel ---
            function procesarExcel(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();

                reader.onload = function (e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Tomamos la primera hoja del archivo Excel
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Convertimos la hoja a un array de arrays (omitimos vacíos)
                        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                        let encontrados = 0;

                        // Asumimos que la fila 0 podría ser los títulos de columna
                        for (let i = 1; i < rows.length; i++) {
                            let cols = rows[i];
                            if (!cols || cols.length < 2) continue; // Fila vacía o sin suficientes datos

                            // [0]Nombre [1]Kgs [2](opt)Costo [3](opt)Venta
                            const rawNombre = cols[0] ? String(cols[0]) : '';
                            const nombreExcel = rawNombre.trim().toLowerCase();
                            if (!nombreExcel) continue;

                            // Convertir Kgs (soportar si vino como numero de excel o string con comas)
                            const rawKgs = String(cols[1]).replace(',', '.');
                            let kgsParsed = parseFloat(rawKgs) || 0;

                            // Costo
                            const rawCosto = cols[2] !== undefined ? String(cols[2]).replace(',', '.') : '';
                            let costoParsed = parseFloat(rawCosto) || '';

                            // Venta
                            const rawVenta = cols[3] !== undefined ? String(cols[3]).replace(',', '.') : '';
                            let ventaParsed = parseFloat(rawVenta) || '';

                            // Buscar coincidencia visual
                            const allLabels = document.querySelectorAll('.cut-item-header label');
                            for (let labelNode of allLabels) {
                                const cleanNodeName = labelNode.innerText.replace('✖', '').trim().toLowerCase();

                                // Coincidencia difusa
                                if (nombreExcel === cleanNodeName || nombreExcel.includes(cleanNodeName) || cleanNodeName.includes(nombreExcel)) {

                                    const forId = labelNode.getAttribute('for');
                                    const inputKg = document.getElementById(forId);

                                    if (inputKg) {
                                        if (kgsParsed > 0) inputKg.value = kgsParsed;

                                        const inputCosto = document.getElementById(`costo_${forId}`);
                                        if (inputCosto && costoParsed !== '') inputCosto.value = costoParsed;

                                        const inputVenta = document.getElementById(`venta_${forId}`);
                                        if (inputVenta && ventaParsed !== '') inputVenta.value = ventaParsed;

                                        if (document.getElementById(`table_${forId}`) && kgsParsed > 0) document.getElementById(`table_${forId}`).value = kgsParsed;
                                        if (document.getElementById(`table_costo_${forId}`) && costoParsed !== '') document.getElementById(`table_costo_${forId}`).value = costoParsed;
                                        if (document.getElementById(`table_venta_${forId}`) && ventaParsed !== '') document.getElementById(`table_venta_${forId}`).value = ventaParsed;

                                        encontrados++;
                                        break; // Ya encontramos este corte
                                    }
                                }
                            }
                        }

                        alert(`Archivo Excel procesado. Se detectaron y cargaron ${encontrados} cortes con base en la primer pestaña de tu planilla.`);
                        calcularTotales();

                    } catch (error) {
                        alert("Ocurrió un error al intentar leer el formato de las celdas del Excel. Asegúrate de que el documento no esté corrupto.");
                        console.error(error);
                    }

                    event.target.value = ""; // Limpiar input
                };

                reader.onerror = function () {
                    alert("No se pudo leer el archivo Excel.");
                };

                // Leemos el archivo real como datos binarios
                reader.readAsArrayBuffer(file);
            }

            // --- Save & Load feature ---
            async function guardarDia() {
                await procesarGuardado(true);
            }

            async function guardarReporte() {
                await procesarGuardado(false);
            }

            async function procesarGuardado(isUpdate) {
                const pesoTotal = parseFloat(pesoTotalInput.value) || 0;
                const cantidadMedias = parseInt(cantidadMediasInput.value) || 1;

                if (pesoTotal === 0) {
                    alert("Por favor ingrese al menos el Total de Kg Despostados antes de guardar.");
                    return;
                }

                if (!isUpdate || !currentReportId) {
                    const customName = prompt("¿Qué nombre le quieres dar a este reporte?", currentReportName);
                    if (customName === null) return; // user cancelled
                    currentReportName = customName || 'Desglose sin título';
                }

                // Gather inputs
                const cutsData = [];
                const gridItems = document.querySelectorAll('.cut-item, .static-cut-item');

                gridItems.forEach(item => {
                    const labelNode = item.querySelector('.cut-item-header label, .static-cut-header');
                    const label = labelNode ? labelNode.innerText : 'Corte Desconocido';
                    const cleanLabel = label.replace('✖', '').trim();
                    const isManual = item.querySelector('.btn-delete') !== null;

                    const input = item.querySelector('.cut-input');
                    const kg = parseFloat(input.value) || 0;

                    const costoInput = item.querySelector('.costo-input');
                    const ventaInput = item.querySelector('.venta-input');
                    const costoPrecio = parseFloat(costoInput.value) || 0;
                    const ventaPrecio = parseFloat(ventaInput.value) || 0;

                    cutsData.push({
                        name: cleanLabel,
                        kg: input.value, // raw string value preserves empty states
                        costo: costoInput.value,
                        venta: ventaInput.value,
                        isManual: isManual
                    });
                });

                const savingData = {
                    id: (isUpdate && currentReportId) ? currentReportId : null,
                    name: currentReportName,
                    resumenTotalkg: document.getElementById('totalkg').innerText,
                    resumenMerma: document.getElementById('merma').innerText,
                    resumenRendimiento: document.getElementById('rendimiento').innerText,
                    cantidadMedias: cantidadMediasInput.value,
                    pesoTotal: pesoTotalInput.value,
                    cuts: cutsData
                };

                try {
                    const res = await fetch('/api/desgloses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(savingData)
                    });
                    const data = await res.json();
                    if (data.success) {
                        currentReportId = data.id;
                        if (isUpdate) {
                            // Feedback visual silencioso
                            const btnDia = document.querySelector('button[onclick="guardarDia()"]');
                            if (btnDia) {
                                const originalText = btnDia.innerText;
                                btnDia.innerText = "¡Guardado!";
                                setTimeout(() => btnDia.innerText = originalText, 2000);
                            }
                        } else {
                            alert('¡Reporte guardado y cerrado! Se limpiará la pantalla.');
                            limpiarDatos(true);
                        }
                    } else {
                        alert('Error al guardar: ' + data.message);
                    }
                } catch (e) {
                    alert('No se pudo guardar, ¿el servidor está encendido?');
                }
            }

            async function renderSavedItems() {
                const container = document.getElementById('savedContainer');
                container.innerHTML = '<i>Cargando desgloses guardados...</i>';

                try {
                    const res = await fetch('/api/desgloses');

                    if (res.status === 401) {
                        alert("Tu sesión expiró");
                        location.reload();
                        return;
                    }

                    const savedStorage = await res.json();
                    desglosesMemoria = savedStorage; // All items intact for Resumen Operativo

                    // Fetch ofertas to see which items are grouped
                    let ofertasActivas = [];
                    try {
                        const oRes = await fetch('/api/ofertas');
                        if (oRes.ok) ofertasActivas = await oRes.json();
                    } catch(e) {}
                    
                    const groupedIds = new Set();
                    ofertasActivas.forEach(o => o.ids_desgloses.forEach(id => groupedIds.add(id)));

                    // Filter out grouped items ONLY FOR UI DISPLAY
                    const itemsToDisplay = savedStorage.filter(item => !groupedIds.has(item.id));

                    if (document.getElementById('summaryTb').classList.contains('active')) {
                        switchResumenView('dia');
                    }

                    container.innerHTML = '';

                    if (itemsToDisplay.length === 0) {
                        container.innerHTML = `
                        <div class="empty-state">
                            <h3>No hay desgloses sueltos en el historial</h3>
                            <p>Todos se encuentran agrupados en Ofertas o aún no has guardado nada.</p>
                        </div>
                    `;
                        return;
                    }

                    // Group data by Month
                    const groupedData = {};

                    itemsToDisplay.forEach(item => {
                        const dateObj = new Date(item.fechaCreacion);

                        // Generate Month Key (e.g., "Marzo 2026")
                        const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });
                        let monthStr = monthFormatter.format(dateObj);
                        monthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1); // Capitalize

                        if (!groupedData[monthStr]) {
                            groupedData[monthStr] = [];
                        }

                        groupedData[monthStr].push(item);
                    });

                    // Build DOM Elements
                    const monthsNames = Object.keys(groupedData).sort((a, b) => {
                        const dateA = new Date(groupedData[a][0] ? groupedData[a][0].fechaCreacion : 0);
                        const dateB = new Date(groupedData[b][0] ? groupedData[b][0].fechaCreacion : 0);
                        return dateB - dateA; // Descending
                    });

                    monthsNames.forEach(monthKey => {
                        // Create Month Group
                        const monthDiv = document.createElement('div');
                        monthDiv.className = 'history-month false'; // Always open or use 'collapsed' if you want

                        const monthHeader = document.createElement('div');
                        monthHeader.className = 'history-month-header';
                        monthHeader.innerText = monthKey;
                        monthHeader.onclick = () => monthDiv.classList.toggle('collapsed');
                        monthDiv.appendChild(monthHeader);

                        const monthContent = document.createElement('div');
                        monthContent.className = 'month-content';

                        // Sort all items in this month descending by date
                        const itemsArr = groupedData[monthKey].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

                        itemsArr.forEach(item => {
                            const dateObj = new Date(item.fechaCreacion);
                            const itemDiv = document.createElement('div');
                            itemDiv.className = 'history-item';
                            
                            const dayDateStr = dateObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
                            const timeStr = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

                            itemDiv.innerHTML = `
                            <div style="display:flex; align-items:center; gap: 10px;">
                                <input type="checkbox" class="chk-agrupar" value="${item.id}" onchange="togglePDFButton()" style="width:20px; height:20px; cursor:pointer;" title="Seleccionar para consolidar">
                                <div class="history-item-info" style="flex:1;">
                                    <h3>${item.name} <small style="color:var(--text-muted); font-weight: normal; margin-left: 8px;">por ${item.creadoPor}</small></h3>
                                    <p>
                                        <span>📅 ${dayDateStr} - 🕒 ${timeStr} hs</span>
                                        <span>⚖️ ${parseFloat(item.pesoTotal||0).toFixed(2)} kg</span>
                                        <span>🥩 ${item.resumenRendimiento}</span>
                                    </p>
                                </div>
                            </div>
                            <div class="history-actions">
                                <button class="btn-load" onclick="cargarDesglose('${item.id}')">📂 Cargar</button>
                                <button class="btn-delete-saved" onclick="borrarDesgloseGuardado('${item.carpetaFecha}', '${item.id}')">🗑️ Eliminar</button>
                            </div>
                        `;
                            monthContent.appendChild(itemDiv);
                        });

                        monthDiv.appendChild(monthContent);
                        container.appendChild(monthDiv);
                    });
                } catch (e) {
                    container.innerHTML = '<span style="color:red">Error de red al cargar el historial</span>';
                }
                
                // Ejecutar la renderización de las Ofertas ahora que la memoria está asegurada post-login/refresh
                cargarOfertasGuardadas();
            }

            function cargarDesglose(id) {
                const itemToLoad = desglosesMemoria.find(item => item.id == id);
                if (!itemToLoad) return;

                if (confirm('¿Cargar este desglose? Los datos actuales en pantalla se sobreescribirán.')) {
                    // Close sidebar on mobile after loading
                    if (window.innerWidth <= 992) toggleSidebar();


                    // Clear all current UI data first
                    limpiarDatosSinPreguntar();

                    // Set Header
                    cantidadMediasInput.value = itemToLoad.cantidadMedias || 1;
                    pesoTotalInput.value = itemToLoad.pesoTotal || '';

                    // Set Cuts
                    itemToLoad.cuts.forEach(savedCut => {
                        let matchingGridInput = null;

                        const allLabels = document.querySelectorAll('.cut-item-header label');
                        for (let labelNode of allLabels) {
                            if (labelNode.innerText.replace('✖', '').trim() === savedCut.name) {
                                const forId = labelNode.getAttribute('for');
                                matchingGridInput = document.getElementById(forId);
                                break;
                            }
                        }

                        if (matchingGridInput) {
                            matchingGridInput.value = savedCut.kg;

                            const idBody = matchingGridInput.id;
                            document.getElementById(`costo_${idBody}`).value = savedCut.costo;
                            document.getElementById(`venta_${idBody}`).value = savedCut.venta;

                            const targetTableInput = document.getElementById(`table_${idBody}`);
                            if (targetTableInput) targetTableInput.value = savedCut.kg;

                            const tableCostoInput = document.getElementById(`table_costo_${idBody}`);
                            if (tableCostoInput) tableCostoInput.value = savedCut.costo;

                            const tableVentaInput = document.getElementById(`table_venta_${idBody}`);
                            if (tableVentaInput) tableVentaInput.value = savedCut.venta;
                        }
                        else {
                            agregarCorteDOM(savedCut.name, true);

                            const recentId = `corte_${cutIndex - 1}`;
                            const recentGridInput = document.getElementById(recentId);

                            recentGridInput.value = savedCut.kg;
                            document.getElementById(`costo_${recentId}`).value = savedCut.costo;
                            document.getElementById(`venta_${recentId}`).value = savedCut.venta;

                            document.getElementById(`table_${recentId}`).value = savedCut.kg;
                            document.getElementById(`table_costo_${recentId}`).value = savedCut.costo;
                            document.getElementById(`table_venta_${recentId}`).value = savedCut.venta;
                        }
                    });

                    calcularTotales();
                    switchTab('calculatorTb');
                }
            }

            function limpiarDatosSinPreguntar() {
                cantidadMediasInput.value = '1';
                pesoTotalInput.value = '';

                const manualCuts = document.querySelectorAll('.btn-delete');
                manualCuts.forEach(btn => {
                    btn.click();
                });

                const currentInputs = document.querySelectorAll('.cut-input');
                const costoInputs = document.querySelectorAll('.costo-input');
                const ventaInputs = document.querySelectorAll('.venta-input');

                currentInputs.forEach(input => {
                    input.value = '';
                    const targetTableInput = document.getElementById(`table_${input.id}`);
                    if (targetTableInput) targetTableInput.value = '';
                });

                costoInputs.forEach(input => {
                    input.value = '';
                    const targetTableInput = document.getElementById(`table_${input.id}`);
                    if (targetTableInput) targetTableInput.value = '';
                });

                ventaInputs.forEach(input => {
                    input.value = '';
                    const targetTableInput = document.getElementById(`table_${input.id}`);
                    if (targetTableInput) targetTableInput.value = '';
                });
            }

            async function borrarDesgloseGuardado(fecha, id) {
                if (confirm('¿Estás seguro que deseas borrar este registro de forma permanente del servidor?')) {
                    try {
                        const res = await fetch(`/api/desgloses/${fecha}/${id}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (data.success) {
                            renderSavedItems();
                        } else {
                            alert(data.message);
                        }
                    } catch (e) {
                        alert('Error de red al intentar borrar.');
                    }
                }
            }

            // --- Summary Tab Features ---
            let currentResumenView = 'dia';

            function switchResumenView(tipo, ofertaId = null) {
                currentResumenView = tipo;
                document.getElementById('btnResDia').classList.remove('active');
                if (document.getElementById('btnResOferta')) document.getElementById('btnResOferta').classList.remove('active');
                document.getElementById('btnResMes').classList.remove('active');
                document.getElementById('btnResAno').classList.remove('active');

                if (tipo === 'dia') document.getElementById('btnResDia').classList.add('active');
                if (tipo === 'oferta') {
                    // Reset dropdown native visual if needed, but the select is independent
                }
                if (tipo === 'mes') document.getElementById('btnResMes').classList.add('active');
                if (tipo === 'ano') document.getElementById('btnResAno').classList.add('active');

                // If not oferta, reset select dropdown
                if(tipo !== 'oferta' && document.getElementById('ofertaSelectResumen')) {
                    document.getElementById('ofertaSelectResumen').value = '';
                }

                generarStatsPorPeriodo(tipo, ofertaId);
            }

            function generarStatsPorPeriodo(tipo, ofertaId = null) {
                const agrupaciones = {};
                let registrosAProcesar = desglosesMemoria;
                let ofertaInfo = null;

                if (tipo === 'oferta' && ofertaId && window.ofertasGlobales) {
                    ofertaInfo = window.ofertasGlobales.find(o => o.id === ofertaId);
                    if(ofertaInfo) {
                        registrosAProcesar = desglosesMemoria.filter(d => ofertaInfo.ids_desgloses.includes(d.id));
                    }
                }

                // 1. Agrupar la data
                registrosAProcesar.forEach(item => {
                    const dateObj = new Date(item.fechaCreacion);
                    let key = "";

                    if (tipo === 'dia') {
                        key = dateObj.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
                    } else if (tipo === 'oferta') {
                        key = ofertaInfo ? `Grupo: ${ofertaInfo.nombre}` : 'Oferta Personalizada';
                    } else if (tipo === 'mes') {
                        const m = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(dateObj);
                        key = m.charAt(0).toUpperCase() + m.slice(1);
                    } else if (tipo === 'ano') {
                        key = dateObj.getFullYear().toString();
                    }

                    if (!agrupaciones[key]) {
                        agrupaciones[key] = { medias: 0, pesoTotal: 0, merma: 0, rendimientos: [] };
                    }

                    agrupaciones[key].medias += parseInt(item.cantidadMedias || 0);
                    agrupaciones[key].pesoTotal += parseFloat(item.pesoTotal || 0);

                    if (item.resumenMerma) {
                        agrupaciones[key].merma += parseFloat(item.resumenMerma.replace(' kg', '')) || 0;
                    }
                    if (item.resumenRendimiento) {
                        agrupaciones[key].rendimientos.push(parseFloat(item.resumenRendimiento.replace('%', '')) || 0);
                    }
                });

                // 2. Llenar los consolidados (De TODOS los registros de todos los periodos)
                let totalMedias = 0;
                let totalKg = 0;
                let totalMerma = 0;
                let allRendimientos = [];

                const listContainer = document.getElementById('periodListContainer');
                listContainer.innerHTML = '';

                // Ordenar las llaves cronologicamente inverso
                const periodKeysSorted = Object.keys(agrupaciones).sort((a, b) => {
                    // Sencillo, las llaves son strings, pero el array interno lo hacemos descendente
                    return -1;
                });

                const keysArr = Object.keys(agrupaciones).reverse();

                if (keysArr.length === 0) {
                    listContainer.innerHTML = '<div class="empty-state">Aún no hay registros calculados para ver resúmenes.</div>';
                }

                keysArr.forEach(key => {
                    const data = agrupaciones[key];

                    totalMedias += data.medias;
                    totalKg += data.pesoTotal;
                    totalMerma += data.merma;
                    allRendimientos = allRendimientos.concat(data.rendimientos);

                    let avgPeriodo = 0;
                    if (data.rendimientos.length > 0) {
                        avgPeriodo = data.rendimientos.reduce((a, b) => a + b, 0) / data.rendimientos.length;
                    }

                    // Inyectar DOM List
                    const div = document.createElement('div');
                    div.className = 'period-item';
                    div.innerHTML = `
                    <div class="period-name">${key}</div>
                    <div class="period-details">
                        <span>🥩 <b>${data.medias}</b> medias</span>
                        <span>⚖️ <b>${data.pesoTotal.toFixed(2)}</b> kg prod.</span>
                        <span>📉 <b>${data.merma.toFixed(2)}</b> kg merma</span>
                        <span>🎯 <b>${avgPeriodo.toFixed(2)}%</b> rend. prom.</span>
                    </div>
                `;
                    listContainer.appendChild(div);
                });

                // Set final global variables
                document.getElementById('sumMediasVal').innerText = totalMedias;
                document.getElementById('sumKgVal').innerHTML = totalKg.toFixed(2) + ` <span class="unit">kg</span>`;
                document.getElementById('sumMermaVal').innerHTML = totalMerma.toFixed(2) + ` <span class="unit">kg</span>`;

                let avgGlobal = 0;
                if (allRendimientos.length > 0) {
                    avgGlobal = allRendimientos.reduce((a, b) => a + b, 0) / allRendimientos.length;
                }
                document.getElementById('avgRendVal').innerHTML = avgGlobal.toFixed(2) + ` <span class="unit">%</span>`;

            }

            // --- Admin Monitor ---
            let adminChartInstance = null; // Guardar referencia al gráfico para destruirlo y redibujarlo

            function renderAdminMonitor() {
                if (currentUserRole !== 'admin') return;

                let sumMedias = 0;
                let sumPeso = 0;
                let sumMerma = 0;
                let totalArrRend = [];

                let sumCostosHistorico = 0;
                let sumVentasHistorico = 0;
                
                // Recolectores Avanzados
                let cortesData = {};
                let sumCarneTotal = 0;
                let sumHuesosGrasa = 0;
                let sumSoloSebo = 0;
                let sumSoloHueso = 0;
                let sumDecomisoGlobal = 0;

                const tableBody = document.getElementById('adminAuditoriaBody');
                tableBody.innerHTML = '';

                // --- 1. Lógica de Filtrado por Rango de Fechas ---
                let desglosesFiltrados = desglosesMemoria;
                
                const fechaDesdeHtml = document.getElementById('adminFechaDesde').value;
                const fechaHastaHtml = document.getElementById('adminFechaHasta').value;

                if (fechaDesdeHtml || fechaHastaHtml) {
                    let dDesde = fechaDesdeHtml ? new Date(fechaDesdeHtml + 'T00:00:00') : new Date('2000-01-01');
                    let dHasta = fechaHastaHtml ? new Date(fechaHastaHtml + 'T23:59:59') : new Date('2100-01-01');
                    
                    desglosesFiltrados = desglosesMemoria.filter(item => {
                        let itemDate = new Date(item.fechaCreacion);
                        return itemDate >= dDesde && itemDate <= dHasta;
                    });
                }

                if (desglosesFiltrados.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding:20px; color:#888;">No hay registros para este periodo histórico.</td></tr>';
                    
                    // Purge metrics and UI cleanly
                    document.getElementById('admInvGlobal').innerText = `$ 0.00`;
                    document.getElementById('admVenGlobal').innerText = `$ 0.00`;
                    document.getElementById('admGananciaGlobal').innerText = `Sin datos de compra/venta cargados`;
                    document.getElementById('admMermaGlobal').innerText = `0 kg`;
                    document.getElementById('admRendGlobal').innerText = `0%`;
                    document.getElementById('admCostoPerrdido').innerText = `Falta cargar costos para calcular pérdida.`;
                    document.getElementById('admTotalFaenadas').innerText = `Basado en 0 medias ingresadas`;
                    if(document.getElementById('admMarkupGlobal')) document.getElementById('admMarkupGlobal').innerText = `0%`;
                    if(document.getElementById('admDescartesGlobal')) document.getElementById('admDescartesGlobal').innerText = `Sebo: 0% | Hueso: 0%`;

                    document.getElementById('listaCortesEstrella').innerHTML = '<li style="color:#888;">Sin datos en la fecha</li>';
                    document.getElementById('listaCortesPerdida').innerHTML = '<li style="color:#888;">Sin datos en la fecha</li>';
                    if(adminChartInstance) adminChartInstance.destroy();
                    return;
                }

                // Sort all chronologically descending for the table
                const cronoDesgloses = [...desglosesFiltrados].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

                cronoDesgloses.forEach(item => {
                    // Global Sums
                    sumMedias += parseInt(item.cantidadMedias || 0);
                    sumPeso += parseFloat(item.pesoTotal || 0);

                    let mermaBruta = 0;
                    if (item.resumenMerma) {
                        mermaBruta = parseFloat(item.resumenMerma.replace(' kg', '')) || 0;
                        sumMerma += mermaBruta;
                    }

                    let rendBruto = 0;
                    if (item.resumenRendimiento) {
                        rendBruto = parseFloat(item.resumenRendimiento.replace('%', '')) || 0;
                        totalArrRend.push(rendBruto);
                    }

                    // Finanzas a nivel registro
                    let costoOperacion = 0;
                    let ventaOperacion = 0;

                    if (item.cuts && Array.isArray(item.cuts)) {
                        item.cuts.forEach(cutData => {
                            const pk = parseFloat(cutData.kg) || 0;
                            const pc = parseFloat(cutData.costo) || 0;
                            const pv = parseFloat(cutData.venta) || 0;

                            costoOperacion += (pk * pc);
                            ventaOperacion += (pk * pv);
                            
                            // Acumular metricas por corte
                            const name = cutData.name.toUpperCase();
                            if(!cortesData[name]) cortesData[name] = { kg: 0, costo: 0, venta: 0 };
                            cortesData[name].kg += pk;
                            cortesData[name].costo += (pk * pc);
                            cortesData[name].venta += (pk * pv);
                            
                            // Torta de rendimiento
                            if(name.includes('HUESO')) {
                                sumHuesosGrasa += pk;
                                sumSoloHueso += pk;
                            } else if (name.includes('SEBO')) {
                                sumHuesosGrasa += pk;
                                sumSoloSebo += pk;
                            } else if (name.includes('GRASA')) {
                                sumHuesosGrasa += pk;
                            } else if (name.includes('DECOMISO')) {
                                sumDecomisoGlobal += pk;
                            } else if (pk > 0) {
                                sumCarneTotal += pk;
                            }
                        });
                    }

                    sumCostosHistorico += costoOperacion;
                    sumVentasHistorico += ventaOperacion;

                    // Llenando tabla
                    const dateObj = new Date(item.fechaCreacion);
                    const fechaTxt = dateObj.toLocaleDateString('es-AR') + " " + dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

                    const pRendLbl = rendBruto < 75 ? `<span style="color:#e53935; font-weight:bold;">${rendBruto}%</span>` : `<span style="color:#43a047; font-weight:bold;">${rendBruto}%</span>`;

                    let gananciaEst = ventaOperacion - costoOperacion;
                    let finTxt = "";
                    if (costoOperacion > 0 || ventaOperacion > 0) {
                        finTxt = `Gastos: $${costoOperacion.toLocaleString(undefined, { maximumFractionDigits: 0 })}<br>`;
                        if (gananciaEst > 0) finTxt += `<small style="color:var(--primary)">+$${gananciaEst.toLocaleString(undefined, { maximumFractionDigits: 0 })} neto</small>`;
                        else finTxt += `<small style="color:#f44336">-$${Math.abs(gananciaEst).toLocaleString(undefined, { maximumFractionDigits: 0 })} neto</small>`;
                    } else {
                        finTxt = "<small style='color:#bbb'>No valorizado</small>";
                    }

                    let rolLbl = item.creadoPor === 'jmunua' ? 'admin' : 'operario';

                    tableBody.innerHTML += `
                        <tr>
                            <td style="font-size:13px; color:#555;">${fechaTxt}</td>
                            <td><strong>${item.name}</strong><br><small style="color:#999">ID: ${item.id.substring(0, 6)}</small></td>
                            <td><span class="badge ${rolLbl}">${item.creadoPor}</span></td>
                            <td>${item.pesoTotal} kg<br><small style="color:#d32f2f">-${mermaBruta} kg merma</small></td>
                            <td>${finTxt}</td>
                        </tr>
                    `;
                });

                // Actualizando Interfaz General 
                document.getElementById('admTotalFaenadas').innerText = `Basado en ${sumMedias} medias ingresadas`;
                document.getElementById('admInvGlobal').innerText = `$ ${sumCostosHistorico.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                document.getElementById('admVenGlobal').innerText = `$ ${sumVentasHistorico.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                const gananciaPura = sumVentasHistorico - sumCostosHistorico;
                const ganDom = document.getElementById('admGananciaGlobal');

                if (gananciaPura > 0) {
                    let rentPct = sumCostosHistorico ? (gananciaPura / sumCostosHistorico) * 100 : 100;
                    if (rentPct < 15) {
                        // Rentabilidad baja, advertencia visual naranja
                        ganDom.innerHTML = `<span style="background:#fff3e0; color:#e65100; border:1px solid #ffcc80; padding:2px 5px; border-radius:4px;">Rentabilidad Crítica: <b>+${rentPct.toFixed(1)}%</b> ($${gananciaPura.toLocaleString('es-AR', { minimumFractionDigits: 0 })})</span>`;
                    } else {
                        ganDom.innerHTML = `Rentabilidad: <b style="color:#2e7d32">+$${gananciaPura.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</b>`;
                    }
                } else if (gananciaPura < 0) {
                    // Pérdida, Alerta Roja fuerte
                    ganDom.innerHTML = `<span style="background:#ffebee; color:#c62828; border:1px solid #ef9a9a; padding:2px 5px; border-radius:4px;">🚨 ALERTA PÉRDIDA: <b>-$${Math.abs(gananciaPura).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</b></span>`;
                } else {
                    ganDom.innerText = "Sin datos de compra/venta cargados";
                }

                document.getElementById('admMermaGlobal').innerText = `${sumMerma.toFixed(1)} kg`;

                // Rendimiento Overall
                let rendOverall = 0;
                if (totalArrRend.length > 0) rendOverall = totalArrRend.reduce((a, b) => a + b, 0) / totalArrRend.length;

                let rDom = document.getElementById('admRendGlobal');
                rDom.innerText = `${rendOverall.toFixed(1)}%`;

                if (rendOverall < 73 && totalArrRend.length > 0) {
                    rDom.style.color = "#d32f2f";
                    rDom.nextElementSibling.innerHTML = "<span style='color:#d32f2f; font-weight:bold;'>⚠️ Bajo rendimiento</span>";
                } else {
                    rDom.style.color = "var(--primary-dark)";
                    rDom.nextElementSibling.innerHTML = "Promedio de faena";
                }

                // Costo perdido por merma aproximado (si hay un costo promedio)
                let costoPerdido = 0;
                if (sumMedias > 0 && sumCostosHistorico > 0) {
                    const avgCostoPorKgFaenado = sumCostosHistorico / sumPeso;
                    costoPerdido = avgCostoPorKgFaenado * sumMerma;
                    document.getElementById('admCostoPerrdido').innerText = `Merma valorizada aprox $ ${costoPerdido.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                } else {
                    document.getElementById('admCostoPerrdido').innerText = "Falta cargar costos para calcular pérdida.";
                }
                
                // MarkUp admin
                const admMarkupDom = document.getElementById('admMarkupGlobal');
                if (sumCostosHistorico > 0) {
                    const markUpHist = ((sumVentasHistorico - sumCostosHistorico) / sumCostosHistorico) * 100;
                    if(admMarkupDom) admMarkupDom.innerText = markUpHist.toFixed(1) + "%";
                } else {
                    if(admMarkupDom) admMarkupDom.innerText = "0%";
                }

                // Descartes Sebo / Hueso Prom
                const admDescartesDom = document.getElementById('admDescartesGlobal');
                if (sumPeso > 0) {
                    let pctSebo = (sumSoloSebo / sumPeso) * 100;
                    let pctHueso = (sumSoloHueso / sumPeso) * 100;
                    if(admDescartesDom) admDescartesDom.innerText = `Sebo: ${pctSebo.toFixed(1)}% | Hueso: ${pctHueso.toFixed(1)}%`;
                } else {
                    if(admDescartesDom) admDescartesDom.innerText = `Sebo: 0% | Hueso: 0%`;
                }

                // --- Rendimiento Secundario: Actualizando Nuevos Paneles ---
                
                // Procesar Cortes Estrella y Pérdidas
                let arrCortes = Object.keys(cortesData).map(k => {
                    let d = cortesData[k];
                    let promVenta = d.kg > 0 ? (d.venta / d.kg) : 0;
                    let margenPct = d.costo > 0 ? ((d.venta - d.costo) / d.costo) * 100 : ((d.venta > 0) ? 100 : 0);
                    return { name: k, margen: d.venta - d.costo, costo: d.costo, venta: d.venta, kg: d.kg, promVenta: promVenta, margenPct: margenPct };
                });
                
                let estrellas = [...arrCortes].sort((a,b) => b.margen - a.margen).filter(c => c.margen > 0).slice(0, 3);
                let perdidas = [...arrCortes].filter(c => c.margen < 0 && c.costo > 0);
                
                let domEstrellas = document.getElementById('listaCortesEstrella');
                domEstrellas.innerHTML = '';
                if(estrellas.length > 0) {
                    estrellas.forEach((e, idx) => {
                        let rank = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                        domEstrellas.innerHTML += `<li>
                            <div style="display:flex; flex-direction:column;">
                                <span>${rank} ${e.name.substring(0, 16)}</span>
                                <small style="color:#666; font-size:11px;">Venta Prom: $${e.promVenta.toLocaleString('es-AR', {maximumFractionDigits: 0})}/kg</small>
                            </div>
                            <b style="color:#2e7d32">+$${e.margen.toLocaleString('es-AR', {minimumFractionDigits: 0})}</b>
                        </li>`;
                    });
                } else domEstrellas.innerHTML = '<li style="color:#888;">No hay ventas que superen el costo aún.</li>';
                
                let domPerdidas = document.getElementById('listaCortesPerdida');
                domPerdidas.innerHTML = '';
                if(perdidas.length > 0) {
                    perdidas.forEach(p => {
                        domPerdidas.innerHTML += `<li>
                            <div style="display:flex; flex-direction:column;">
                                <span>❌ ${p.name.substring(0, 16)}</span>
                                <small style="color:#666; font-size:11px;">Venta Prom: $${p.promVenta.toLocaleString('es-AR', {maximumFractionDigits: 0})}/kg</small>
                            </div>
                            <b style="color:#c62828">-$${Math.abs(p.margen).toLocaleString('es-AR', {minimumFractionDigits: 0})}</b>
                        </li>`;
                    });
                } else domPerdidas.innerHTML = '<li style="color:#2e7d32;">Todos tus cortes recuperan la inversión. ¡Excelente!</li>';

                let domDetalleCortes = document.getElementById('adminCortesDetalleBody');
                if(domDetalleCortes) {
                    domDetalleCortes.innerHTML = '';
                    let cortesOrdenados = [...arrCortes].sort((a,b) => b.venta - a.venta);
                    if (cortesOrdenados.length > 0) {
                        cortesOrdenados.forEach(c => {
                            let mColor = c.margen >= 0 ? '#2e7d32' : '#c62828';
                            domDetalleCortes.innerHTML += `
                                <tr>
                                    <td><strong>${c.name}</strong></td>
                                    <td>${c.kg.toFixed(2)} kg</td>
                                    <td><strong>$${c.promVenta.toLocaleString('es-AR', {minimumFractionDigits: 0, maximumFractionDigits: 2})}</strong></td>
                                    <td style="color:${mColor}; font-weight:bold;">$${c.margen.toLocaleString('es-AR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                                    <td style="color:${mColor}; font-weight:bold;">${c.margenPct.toFixed(1)}%</td>
                                </tr>
                            `;
                        });
                    } else {
                        domDetalleCortes.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">Sin datos de cortes</td></tr>';
                    }
                }
                
                // Actualizar Chart.js Pie Chart
                const ctx = document.getElementById('chartResumen').getContext('2d');
                if(adminChartInstance) adminChartInstance.destroy();
                
                adminChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Carne Útil / Cortes', 'Huesos, Grasa y Sebo', 'Decomiso', 'Merma Irrecuperable'],
                        datasets: [{
                            data: [sumCarneTotal, sumHuesosGrasa, sumDecomisoGlobal, sumMerma],
                            backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: {size: 11} } } }
                    }
                });
            }

            function togglePDFButton() {
                const checkboxes = document.querySelectorAll('.chk-agrupar:checked');
                const bar = document.getElementById('pdfActionBar');
                const countSpan = document.getElementById('pdfSelectionsCount');
                if (checkboxes.length > 0) {
                    bar.style.display = 'block';
                    countSpan.innerText = `${checkboxes.length} seleccionados`;
                } else {
                    bar.style.display = 'none';
                }
            }

            function generarPDFSeleccionados() {
                const checkboxes = document.querySelectorAll('.chk-agrupar:checked');
                if (checkboxes.length === 0) return;

                // Consolidate Data
                let totalMedias = 0;
                let totalBruto = 0;
                let totalMermaVal = 0;
                let totalRendimientos = [];
                let cortesConsolidados = {};
                let totalCostoInvertido = 0;
                let totalIngresoGenerado = 0;
                const uniqueDates = new Set();

                checkboxes.forEach(chk => {
                    const item = desglosesMemoria.find(d => d.id === chk.value);
                    if (!item) return;

                    const dObj = new Date(item.fechaCreacion);
                    uniqueDates.add(dObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }));

                    totalMedias += parseInt(item.cantidadMedias || 0);
                    totalBruto += parseFloat(item.pesoTotal || 0);
                    
                    let m = parseFloat((item.resumenMerma || "0").replace(' kg', '')) || 0;
                    totalMermaVal += m;

                    let rnd = parseFloat((item.resumenRendimiento || "0").replace('%', '')) || 0;
                    if (rnd > 0) totalRendimientos.push(rnd);

                    if (item.cuts) {
                        item.cuts.forEach(cut => {
                            let kg = parseFloat(cut.kg || 0);
                            if (kg > 0) {
                                if (!cortesConsolidados[cut.name]) {
                                    cortesConsolidados[cut.name] = { kg: 0, costoTotal: 0, ingresoTotal: 0 };
                                }
                                cortesConsolidados[cut.name].kg += kg;
                                
                                let cst = parseFloat(cut.costo || 0);
                                let vta = parseFloat(cut.venta || 0);
                                
                                let totalCostoCut = kg * cst;
                                let totalIngresoCut = kg * vta;
                                
                                cortesConsolidados[cut.name].costoTotal += totalCostoCut;
                                cortesConsolidados[cut.name].ingresoTotal += totalIngresoCut;
                                
                                totalCostoInvertido += totalCostoCut;
                                totalIngresoGenerado += totalIngresoCut;
                            }
                        });
                    }
                });

                let mediaRendimiento = totalRendimientos.length > 0 ? (totalRendimientos.reduce((a, b) => a + b, 0) / totalRendimientos.length) : 0;
                let mermaPorcentaje = totalBruto > 0 ? (totalMermaVal / totalBruto) * 100 : 0;
                let gananciaNeta = totalIngresoGenerado - totalCostoInvertido;
                let totalKilosEnCortes = totalBruto - totalMermaVal;

                // Populate PDF Template
                document.getElementById('pdfFechaEmision').innerText = `Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`;
                document.getElementById('pdfTotalMedias').innerText = totalMedias;
                document.getElementById('pdfTotalBruto').innerText = totalBruto.toFixed(2);
                document.getElementById('pdfTotalUtiles').innerText = totalKilosEnCortes.toFixed(2);
                document.getElementById('pdfMerma').innerText = totalMermaVal.toFixed(2);
                document.getElementById('pdfMermaPorc').innerText = mermaPorcentaje.toFixed(2);
                
                document.getElementById('pdfCostoTotal').innerText = "$" + totalCostoInvertido.toLocaleString('es-AR', {minimumFractionDigits:2});
                document.getElementById('pdfIngresoGlobal').innerText = "$" + totalIngresoGenerado.toLocaleString('es-AR', {minimumFractionDigits:2});
                
                let ganNetaDom = document.getElementById('pdfGananciaNeta');
                ganNetaDom.innerText = "$" + gananciaNeta.toLocaleString('es-AR', {minimumFractionDigits:2});
                ganNetaDom.style.color = gananciaNeta >= 0 ? '#1b5e20' : '#c62828';
                
                document.getElementById('pdfRendimiento').innerText = mediaRendimiento.toFixed(2) + "%";

                let cortesTableBody = document.getElementById('pdfCortesBody');
                cortesTableBody.innerHTML = '';
                
                let cortesSorted = Object.keys(cortesConsolidados).map(k => {
                    return { name: k, ...cortesConsolidados[k] };
                }).sort((a,b) => b.kg - a.kg);

                cortesSorted.forEach(c => {
                    let pctParticipacion = totalKilosEnCortes > 0 ? (c.kg / totalKilosEnCortes) * 100 : 0;
                    cortesTableBody.innerHTML += `
                        <tr>
                            <td style="padding: 8px; border:1px solid #ecccd7; font-weight:bold;">${c.name}</td>
                            <td style="padding: 8px; border:1px solid #ecccd7; text-align:center;">${c.kg.toFixed(2)} kg</td>
                            <td style="padding: 8px; border:1px solid #ecccd7; text-align:center;">${pctParticipacion.toFixed(1)}%</td>
                            <td style="padding: 8px; border:1px solid #ecccd7; text-align:right;">$${c.ingresoTotal.toLocaleString('es-AR', {maximumFractionDigits:0})}</td>
                        </tr>
                    `;
                });

                // Set unique grouped dates to PDF Header
                const txtDias = Array.from(uniqueDates).join(' | ');
                const diasTag = document.getElementById('pdfDiasIncluidos');
                if(diasTag) {
                    diasTag.innerText = txtDias ? `Lotes del: ${txtDias}` : '';
                }

                // Rendering
                const pdfDiv = document.getElementById('pdf-report-template');
                pdfDiv.style.display = 'block';

                const opt = {
                    margin:       0.5,
                    filename:     `Consolidado_Oferta_${Date.now()}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(pdfDiv).save().then(() => {
                    pdfDiv.style.display = 'none'; // Hide again
                    
                    // Uncheck UI
                    checkboxes.forEach(c => c.checked = false);
                    togglePDFButton();
                });
            }

            // --- OFERTAS Y SELECCION MASIVA ---

            function seleccionarPorFechas() {
                const desdeVal = document.getElementById('filtroDesde').value;
                const hastaVal = document.getElementById('filtroHasta').value;

                if(!desdeVal || !hastaVal) {
                    alert('Seleccione ambas fechas (Desde y Hasta).');
                    return;
                }

                // Normalizar fechas
                const fd = new Date(desdeVal);
                fd.setDate(fd.getDate() + 1);
                fd.setHours(0,0,0,0);
                
                const fh = new Date(hastaVal);
                fh.setDate(fh.getDate() + 1);
                fh.setHours(23,59,59,999);

                // Desmarcar todos primero
                document.querySelectorAll('.chk-agrupar').forEach(c => c.checked = false);

                let marcados = 0;
                document.querySelectorAll('.chk-agrupar').forEach(chk => {
                    const item = desglosesMemoria.find(d => d.id === chk.value);
                    if(item) {
                        const fi = new Date(item.fechaCreacion);
                        if(fi >= fd && fi <= fh) {
                            chk.checked = true;
                            marcados++;
                        }
                    }
                });

                togglePDFButton();
                if(marcados > 0) {
                    alert(`Se han marcado ${marcados} desgloses en este rango temporal.`);
                } else {
                    alert('No hay desgloses en ese rango de fechas.');
                }
            }

            async function guardarOfertaSeleccionados() {
                const checkboxes = document.querySelectorAll('.chk-agrupar:checked');
                if (checkboxes.length === 0) return;

                const nombreOferta = prompt(`Está por agrupar y guardar ${checkboxes.length} desgloses. ¿Nombre del grupo?`);
                if(!nombreOferta) return;

                const ids = Array.from(checkboxes).map(c => c.value);

                try {
                    const res = await fetch('/api/ofertas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: nombreOferta, ids_desgloses: ids })
                    });
                    const d = await res.json();
                    if(d.success) {
                        cargarOfertasGuardadas();
                        checkboxes.forEach(c => c.checked = false);
                        togglePDFButton();
                    } else {
                        alert(d.message);
                    }
                } catch(e) {
                    alert('Error de red al guardar grupo.');
                }
            }

            async function cargarOfertasGuardadas() {
                const container = document.getElementById('ofertasContainer');
                if(!container) return;

                try {
                    const res = await fetch('/api/ofertas');
                    const ofertas = await res.json();

                    container.innerHTML = '';
                    if(ofertas.length === 0) {
                        container.innerHTML = '<p style="color:#666; font-size: 13px; margin: 0;">No tienes grupos guardados aún. Tilda reportes abajo y guárdalos.</p>';
                        return;
                    }

                    window.ofertasGlobales = ofertas;

                    // Llenar el Dropdown de la Pestaña Resumen Operativo
                    const drop = document.getElementById('ofertaSelectResumen');
                    if(drop) {
                        drop.innerHTML = '<option value="">-- Ver por Oferta --</option>';
                        ofertas.forEach(o => {
                            drop.innerHTML += `<option value="${o.id}">${o.nombre}</option>`;
                        });
                    }

                    ofertas.forEach(o => {
                        let subItemsHTML = '';
                        o.ids_desgloses.forEach(id => {
                            const dInfo = desglosesMemoria.find(d => d.id === id);
                            if(dInfo) {
                                const dt = new Date(dInfo.fechaCreacion);
                                subItemsHTML += `
                                <div style="background: white; border: 1px solid #ddd; padding: 6px 10px; border-radius: 4px; font-size: 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
                                    <div>
                                        <span style="color:var(--primary-dark); font-weight:bold;">${dInfo.name || 'Sin nombre'}</span> <span style="color:#888;">| 📅 ${dt.toLocaleDateString('es-AR', {day:'numeric', month:'short'})} 🕒 ${dt.toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})}hs</span>
                                        <br>
                                        <span style="color:#555;">⚖️ ${parseFloat(dInfo.pesoTotal||0).toFixed(2)} kg &nbsp;|&nbsp; 🥩 ${dInfo.resumenRendimiento}</span>
                                    </div>
                                    <div>
                                        <button title="Cargar a Pantalla" onclick="cargarDesglose('${id}')" style="background:#fff; border:1px solid #ccc; color:#333; cursor:pointer; padding:3px 6px; border-radius:3px;">📂 Ver</button>
                                    </div>
                                </div>
                                `;
                            }
                        });


                        const div = document.createElement('div');
                        div.style.background = '#f5f5f5';
                        div.style.padding = '8px 12px';
                        div.style.borderRadius = '6px';
                        div.style.border = '1px solid #ddd';

                        const oId = 'oferta_det_' + o.id;

                        div.innerHTML = `
                            <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="const e = document.getElementById('${oId}'); e.style.display = e.style.display === 'none' ? 'block' : 'none'">
                                <div>
                                    <strong style="color:var(--primary-dark); font-size:14px;">${o.nombre}</strong><br>
                                    <small style="color:#1565c0; font-size:12px;">▶ Ver ${o.ids_desgloses.length} lotes agrupados</small>
                                </div>
                                <div style="display:flex; gap:5px;" onclick="event.stopPropagation()">
                                    <button title="Generar PDF" onclick="imprimirOfertaGuardada('${o.id}')" style="background:#2196f3; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">📄 PDF</button>
                                    <button title="Eliminar Grupo" onclick="eliminarOfertaGuardada('${o.id}')" style="background:#f44336; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">🗑️</button>
                                </div>
                            </div>
                            <div id="${oId}" style="display:none; margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
                                ${subItemsHTML || '<div style="color:#888; font-size:12px;">No se encontraron los datos locales de estos lotes.</div>'}
                            </div>
                        `;
                        container.appendChild(div);
                    });
                } catch (e) {
                    console.error('Error cargando ofertas guardadas');
                }
            }

            async function eliminarOfertaGuardada(id) {
                if(confirm('¿Seguro que quieres borrar este grupo? (Tus reportes individuales intactos)')) {
                    try {
                        const res = await fetch(`/api/ofertas/${id}`, { method: 'DELETE' });
                        const d = await res.json();
                        if(d.success) {
                            cargarOfertasGuardadas();
                        } else {
                            alert(d.message);
                        }
                    } catch(e) {
                        alert('Error al borrar');
                    }
                }
            }

            async function imprimirOfertaGuardada(idOferta) {
                try {
                    const res = await fetch('/api/ofertas');
                    const ofertas = await res.json();
                    const oferta = ofertas.find(o => o.id === idOferta);
                    if(!oferta) return alert('Oferta no encontrada.');

                    // Seleccionar invisibles
                    document.querySelectorAll('.chk-agrupar').forEach(c => c.checked = false);
                    let found = 0;
                    document.querySelectorAll('.chk-agrupar').forEach(chk => {
                        if(oferta.ids_desgloses.includes(chk.value)) {
                            chk.checked = true;
                            found++;
                        }
                    });

                    if(found === 0) {
                        alert('No se encontraron los lotes en el historial para generar el PDF (pueden haber sido eliminados individualmente).');
                        document.querySelectorAll('.chk-agrupar').forEach(c => c.checked = false);
                        return;
                    }

                    // Dinamizar título de PDF
                    const oldTitle = document.querySelector('#pdf-report-template h2').innerText;
                    document.querySelector('#pdf-report-template h2').innerText = `Consolidado de Grupo: ${oferta.nombre}`;
                    
                    togglePDFButton();
                    generarPDFSeleccionados();

                    // Restaurar título original
                    setTimeout(() => {
                        document.querySelector('#pdf-report-template h2').innerText = oldTitle;
                    }, 3000);

                } catch(e){
                    alert('Error');
                }
            }

            // Inicialización general
            // Note: El arranque primario "cold" de la informacion ahora está anclado en renderSavedItems() post-login
            // por seguridad y para mantener la coherencia de datos con cuentas deslogueadas.

            /* --- Settings UI Logic --- */
            function openSettings() {
                document.getElementById('settingsModal').style.display = 'flex';
                document.getElementById('themeSelect').value = document.documentElement.getAttribute('data-theme') || 'carmesi';
                document.getElementById('layoutSelect').value = document.documentElement.getAttribute('data-layout') || 'normal';
            }
            
            function closeSettings() {
                document.getElementById('settingsModal').style.display = 'none';
            }
            
            
            function saveSettings() {
                const theme = document.getElementById('themeSelect').value;
                const layout = document.getElementById('layoutSelect').value;
                
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.setAttribute('data-layout', layout);
                
                localStorage.setItem('appTheme', theme);
                localStorage.setItem('appLayout', layout);
                
                closeSettings();
            }

            /* --- Draggable Universal Dashboard --- */
            function initUniversalSortable() {
                const gridOptions = {
                    animation: 150,
                    handle: '.drag-handle',
                    ghostClass: 'sortable-ghost',
                    dragClass: 'sortable-drag'
                };

                // Helper para inicializar grillas con persistencia
                const initGrid = (id, groupName) => {
                    const el = document.getElementById(id);
                    if (el) {
                        Sortable.create(el, Object.assign({}, gridOptions, {
                            group: groupName,
                            store: {
                                get: function(sortable) {
                                    var order = localStorage.getItem('sort_' + groupName);
                                    return order ? order.split('|') : [];
                                },
                                set: function(sortable) {
                                    var order = sortable.toArray();
                                    localStorage.setItem('sort_' + groupName, order.join('|'));
                                }
                            }
                        }));
                    }
                };

                // Instanciar todas las grillas de la app
                initGrid('calcGrid', 'calc_main');
                initGrid('historyGrid', 'history_main');
                initGrid('resumenStatsGrid', 'resumen_stats');
                initGrid('adminFinancialGrid', 'admin_fin');
                initGrid('adminAdvancedGrid', 'admin_adv');
            }

            // Iniciar sortable al cargar la página si el script fue cargado
            document.addEventListener('DOMContentLoaded', () => {
                if (typeof Sortable !== 'undefined') {
                    initUniversalSortable();
                }
            });