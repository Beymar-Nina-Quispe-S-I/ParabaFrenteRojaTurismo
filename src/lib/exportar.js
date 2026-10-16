import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// ============================================================
// EXPORTAR A PDF
// ============================================================
const INSTITUCION = 'INSTITUTO TÉCNICO BOLIVIANO FRANCÉS'

function valorFicha(valor) {
  if (Array.isArray(valor)) return valor.length ? valor.join(', ') : 'Sin datos registrados'
  return valor === null || valor === undefined || valor === ''
    ? 'Sin datos registrados'
    : String(valor)
}

function dibujarEncabezado(doc, titulo, subtitulo) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(27, 59, 67)
  doc.rect(0, 0, pageWidth, 31, 'F')
  doc.setFillColor(49, 124, 97)
  doc.rect(0, 31, pageWidth, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(INSTITUCION, 14, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('BIODIVERSIDAD · REGISTRO DE AVES', 14, 19)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(titulo, 14, 27)
  if (subtitulo) {
    doc.setTextColor(84, 94, 94)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(subtitulo, 14, 38)
  }
}

function dibujarPie(doc) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageCount = doc.internal.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(215, 222, 219)
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15)
    doc.setTextColor(100, 111, 108)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(INSTITUCION, 14, pageHeight - 9)
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - 14, pageHeight - 9, {
      align: 'right',
    })
  }
}

function agregarTablaFicha(doc, titulo, filas, startY) {
  autoTable(doc, {
    startY,
    head: [[titulo, '']],
    body: filas.length ? filas : [['', 'Sin datos registrados']],
    theme: 'striped',
    headStyles: { fillColor: [49, 124, 97], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 248, 246] },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [45, 55, 53] },
    columnStyles: { 0: { cellWidth: 54, fontStyle: 'bold' } },
    margin: { left: 14, right: 14, bottom: 20 },
  })
}

export function exportarFichaPDF(ave) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  dibujarEncabezado(doc, 'FICHA TÉCNICA DE AVE', valorFicha(ave.nombre))

  doc.setTextColor(35, 59, 54)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(valorFicha(ave.nombre), 14, 49, { maxWidth: pageWidth - 28 })
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(49, 124, 97)
  doc.text(valorFicha(ave.nombre_cientifico), 14, 57, { maxWidth: pageWidth - 28 })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(55, 64, 61)
  const descripcion = doc.splitTextToSize(valorFicha(ave.descripcion), pageWidth - 28)
  doc.text(descripcion, 14, 65)
  let y = 68 + descripcion.length * 4.5

  agregarTablaFicha(doc, 'TAXONOMÍA', [
    ['Reino', valorFicha(ave.reino)],
    ['Filo', valorFicha(ave.filo)],
    ['Clase', valorFicha(ave.clase)],
    ['Orden', valorFicha(ave.orden)],
    ['Familia', valorFicha(ave.familia)],
    ['Género', valorFicha(ave.genero)],
    ['Especie', valorFicha(ave.especie)],
  ], y)
  y = doc.lastAutoTable.finalY + 5

  agregarTablaFicha(doc, 'DATOS BIOLÓGICOS', [
    ['Conservación', valorFicha(ave.estado)],
    ['Hábitat', valorFicha(ave.habitat)],
    ['Distribución', valorFicha(ave.distribucion)],
    ['Alimentación', valorFicha(ave.alimentacion)],
    ['Tamaño', valorFicha(ave.tamano)],
    ['Peso', valorFicha(ave.peso)],
    ['Envergadura', valorFicha(ave.envergadura)],
    ['Vida silvestre', valorFicha(ave.vida_silvestre)],
    ['Reproducción', valorFicha(ave.reproduccion)],
  ], y)
  y = doc.lastAutoTable.finalY + 5

  const amenazas = Array.isArray(ave.amenazas) ? ave.amenazas : []
  agregarTablaFicha(doc, 'AMENAZAS', amenazas.map((item, index) => [`${index + 1}.`, item]), y)
  y = doc.lastAutoTable.finalY + 5

  const curiosidades = Array.isArray(ave.curiosidades) ? ave.curiosidades : []
  agregarTablaFicha(doc, 'CURIOSIDADES', curiosidades.map((item) => ['', item]), y)
  dibujarPie(doc)
  doc.save(`ficha-${ave.id || 'ave'}.pdf`)
}

// ============================================================
// EXPORTAR A EXCEL
// ============================================================
export function exportarFichaExcel(ave) {
  const wb = XLSX.utils.book_new()

  // Hoja 1: Datos generales
  const datosGenerales = [
    ['FICHA TÉCNICA', ave.nombre],
    ['Nombre científico', ave.nombreCientifico],
    ['Descripción', ave.descripcion],
    ['', ''],
    ['TAXONOMÍA', ''],
    ['Reino', ave.reino],
    ['Filo', ave.filo],
    ['Clase', ave.clase],
    ['Orden', ave.orden],
    ['Familia', ave.familia],
    ['Género', ave.genero],
    ['Especie', ave.especie],
    ['', ''],
    ['DATOS BIOLÓGICOS', ''],
    ['Estado de conservación', ave.estado],
    ['Hábitat', ave.habitat],
    ['Distribución', ave.distribucion],
    ['Alimentación', ave.alimentacion],
    ['Tamaño', ave.tamano],
    ['Peso', ave.peso],
    ['Envergadura', ave.envergadura],
    ['Vida silvestre', ave.vidaSilvestre],
    ['Reproducción', ave.reproduccion],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(datosGenerales)
  ws1['!cols'] = [{ wch: 25 }, { wch: 80 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Datos')

  // Hoja 2: Amenazas
  const amenazas = [['#', 'Amenaza']]
  ave.amenazas.forEach((a, i) => amenazas.push([i + 1, a]))
  const ws2 = XLSX.utils.aoa_to_sheet(amenazas)
  ws2['!cols'] = [{ wch: 5 }, { wch: 80 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Amenazas')

  // Hoja 3: Curiosidades
  const curiosidades = [['#', 'Curiosidad']]
  ave.curiosidades.forEach((c, i) => curiosidades.push([i + 1, c]))
  const ws3 = XLSX.utils.aoa_to_sheet(curiosidades)
  ws3['!cols'] = [{ wch: 5 }, { wch: 80 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Curiosidades')

  // Descargar
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, `ficha-${ave.id}.xlsx`)
}

// ============================================================
// EXPORTAR TODAS LAS AVES
// ============================================================
export function exportarTodasPDF(aves) {
  const doc = new jsPDF()
  dibujarEncabezado(doc, 'CATÁLOGO DE FICHAS TÉCNICAS', `${aves.length} especies registradas`)
  autoTable(doc, {
    startY: 46,
    head: [['N°', 'Nombre común', 'Nombre científico', 'Familia', 'Conservación']],
    body: aves.map((ave, index) => [
      index + 1,
      valorFicha(ave.nombre),
      valorFicha(ave.nombre_cientifico),
      valorFicha(ave.familia),
      valorFicha(ave.estado),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [49, 124, 97], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 248, 246] },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 10 }, 2: { fontStyle: 'italic' } },
    margin: { left: 14, right: 14, bottom: 20 },
  })
  dibujarPie(doc)
  doc.save('fichas-tecnicas.pdf')
}

export function exportarHistorialPDF({ usuario, eventos, desde, hasta, generadoPor }) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const ahora = new Date()
  const selloTiempo = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, '0'),
    String(ahora.getDate()).padStart(2, '0'),
    '-',
    String(ahora.getHours()).padStart(2, '0'),
    String(ahora.getMinutes()).padStart(2, '0'),
    String(ahora.getSeconds()).padStart(2, '0'),
  ].join('')
  const aleatorio = new Uint32Array(1)
  globalThis.crypto.getRandomValues(aleatorio)
  const codigo = `ITBF-${selloTiempo}-${aleatorio[0].toString(16).toUpperCase().padStart(8, '0')}`

  doc.setFillColor(27, 59, 67)
  doc.rect(0, 0, pageWidth, 34, 'F')
  doc.setFillColor(49, 124, 97)
  doc.rect(0, 34, pageWidth, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(INSTITUCION, 14, 11)
  doc.setFontSize(15)
  doc.text('HISTORIAL PERSONAL DE ACTIVIDAD', 14, 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Reporte ${codigo}`, 14, 29)

  doc.setTextColor(45, 55, 53)
  doc.setFontSize(9)
  doc.text(`Usuario: ${usuario.nombre || usuario.usuario || 'Sin nombre'} (@${usuario.usuario || 'usuario'})`, 14, 44)
  doc.text(`Periodo: ${desde} al ${hasta}`, 14, 50)
  doc.text(`Generado: ${ahora.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'medium' })}`, 14, 56)
  doc.text(`Emitido por: ${generadoPor || 'Administrador'}`, pageWidth - 14, 44, { align: 'right' })

  autoTable(doc, {
    startY: 63,
    head: [['Fecha y hora', 'Tipo', 'Actividad', 'Estado', 'Detalle']],
    body: eventos.map((evento) => [
      new Date(evento.fecha).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'medium' }),
      evento.categoria,
      evento.accion,
      evento.estado || '—',
      [evento.titulo, evento.detalle].filter(Boolean).join(' · '),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [49, 124, 97], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 248, 246] },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 24 },
      2: { cellWidth: 47 },
      3: { cellWidth: 24 },
    },
    margin: { left: 14, right: 14, bottom: 22 },
  })

  const paginas = doc.internal.getNumberOfPages()
  const alto = doc.internal.pageSize.getHeight()
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina)
    doc.setDrawColor(215, 222, 219)
    doc.line(14, alto - 15, pageWidth - 14, alto - 15)
    doc.setTextColor(90, 100, 96)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Código de verificación: ${codigo}`, 14, alto - 9)
    doc.text(`Página ${pagina} de ${paginas}`, pageWidth - 14, alto - 9, { align: 'right' })
  }

  const usuarioArchivo = (usuario.usuario || usuario.id || 'usuario').toString().replace(/[^a-zA-Z0-9_-]/g, '-')
  doc.save(`historial-${usuarioArchivo}-${selloTiempo}.pdf`)
  return codigo
}