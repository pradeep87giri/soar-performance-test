$("#btn-download-report").on("click", function () {
  callExportPdf();
});

function callExportPdf() {
  showLoadingOverlay();
  $(".monkop_page").show();
  window.scrollTo(0, 0);
  exportPdf().then(() => {
    hideLoadingOverlay();
  })
}

function exportPdf() {
  return new Promise((resolve, reject) => {
    let pdfContainer = $("<div id='pdf-clone-container'></div>");
    let targetElem = $("#main-printable-section");
    const targetWidth = $(targetElem).outerWidth();
    let clonedElem = $(targetElem).clone();
    $(document.body).append(pdfContainer);
    $(pdfContainer).css({ width: `${targetWidth}px` });
    $(pdfContainer).append(clonedElem);
    // Apply dom modifications to cloned element
    applyPDFDomMods(clonedElem);
    const canvasHeight = $(clonedElem).outerHeight();
    const canvasWidth = $(clonedElem).outerWidth();
    html2canvas(clonedElem[0], {
      onclone: (document) => {
        $(pdfContainer).remove();
      },
      width: canvasWidth,
      height: canvasHeight,
      scrollX: 0,
      scrollY: -window.scrollY
    }).then((canvas) => {
      const jsPDF = new jspdf.jsPDF({
        orientation: "p",
        unit: "px",
        format: [canvasWidth, canvasHeight],
        hotfixes: ["px_scaling"]
      });
      jsPDF.addImage(canvas, "PNG", 0, 0, canvasWidth, canvasHeight);
      const fileName = `${state.testInfo.name}.pdf`;
      jsPDF.save(fileName);
      resolve(canvas);
    });
  });
}

function applyPDFDomMods(cloneElem) {
  const removeElements = ["#video-section", "#charts-mode-section", "#resources-sidepanel", "#more-information-section", "#large-charts-panel", "#btn-toggle-panel", "#short-charts-panel", "#alert-apptim-container", "#threadsCount-container", "#page_logs", state.crashInfo.quantity == 0 ? "#page_errors" : "", "#skipped-summary-items"];
  // Remove elements
  removeElements.forEach((e) => {
    $(cloneElem).find(e).remove();
  });

  // Make full width
  $(cloneElem).find("#summary-section").removeClass("col-lg-7").addClass("col-lg-12");
  $(cloneElem).find("#session-info-section").removeClass("col-lg-7").addClass("col-lg-12");
  // Show multi chart
  $(cloneElem).find("#multiple-chart-container").show();
  // Open all collapsibles
  $(cloneElem).find("#collapse_summary_pass").removeClass("collapsed").addClass("collapse in");
  $(cloneElem).find(".panel_summary").removeClass("small-fixed-container");
  $(cloneElem).find("#summary-items-container").removeClass("summary-items-fixed-body");
  // Copy app icon and name
  $(cloneElem).find("#page_summary").prepend($("#nav_app-icon").clone());

  return cloneElem;
}
