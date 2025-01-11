var navhash = "";
var deBouncer = function ($, cf, of, interval) {
  var debounce = function (func, threshold, execAsap) {
    var timeout;
    return function debounced() {
      var obj = this,
        args = arguments;
      function delayed() {
        if (!execAsap) func.apply(obj, args);
        timeout = null;
      }
      if (timeout) clearTimeout(timeout);
      else if (execAsap) func.apply(obj, args);
      timeout = setTimeout(delayed, threshold || interval);
    };
  };
  jQuery.fn[cf] = function (fn) {
    return fn ? this.bind(of, debounce(fn)) : this.trigger(cf);
  };
};

$(window).on("load", async function () {
  await waitForFilesReady();
  // Check if report is embedded and take action.
  toggleEmbeddedReportStatus();
  checkHashStatus();
  ui(false);
  unveilImg();
  fadeOutBlockLoader();
  togglePrivateMenu();
  deBouncer(jQuery, "smartresize", "resize", 100);
  $("div.monkop-navbar img").trigger("unveil");

  $(window).smartresize(function (e) {
    ui(true);
  });
});

function isEmbeddedMode() {
  let embedParam = getParameterByName("embedded");
  return embedParam.toLowerCase() == "true";
}

function toggleEmbeddedReportStatus() {
  var isEmbedded = isEmbeddedMode();
  if (isEmbedded) $("body").addClass("report-embedded");
}

function togglePrivateMenu() {
  if (window.location.href.indexOf("file://") != -1) {
    $(".private-menu").hide();
    $(".public-menu").hide();
  } else if (window.location.href.indexOf("/public/") == -1) {
    $(".private-link").attr(
      "href",
      `/rides.xhtml?makepublic=true&reportId=${getReportIdFromUrl()}`
    );
    $(".private-menu").show();
    $(".public-menu").hide();
  } else {
    $(".private-menu").hide();
    $(".public-menu").show();
  }
}

$(".private-menu, .dropdown-publish").hover(
  function () {
    $("#publish-button").removeClass("fa-lock").addClass("fa-unlock");
    $(".dropdown-publish").stop().slideDown();
  },
  function () {
    $("#publish-button").removeClass("fa-unlock").addClass("fa-lock");
    $(".dropdown-publish").stop().slideUp();
  }
);

function ui(onResize) {
  //HOVER ON STATICS IMG
  if (!onResize) {
    //Initialize the Tabs in correctness
    $(".nav-tabs a").click(function (e) {
      e.preventDefault();
      $(this).tab("show");
    });

    //Hide sidebar code
    $(".hide-menu-button").click(function () {
      $("#side-menu li span").hide();
      $("#side-menu li b").hide();
      $("#side-menu li a .menu-selected").hide();
      $(".logo-sidebar").hide();
      $(".hide-menu-apptim-version").hide();
      $(".hide-menu-button").hide();

      $(".navbar-static-side").animate(
        {
          width: "68px",
        },
        300
      );
      $("#page-wrapper").animate(
        {
          margin: "-30px 0 0 90px",
        },
        300,
        function () {
          $(".show-menu-button").fadeIn();
        }
      );
    });
    $(".show-menu-button").click(function () {
      $(".show-menu-button").hide();
      $(".navbar-static-side").animate(
        {
          width: "250px",
        },
        200
      );

      $("#page-wrapper").animate(
        {
          margin: "-30px 0 0 250px",
        },
        300,
        function () {
          $("#side-menu li span").fadeIn();
          $("#side-menu li b").fadeIn();
          $(".logo-sidebar").fadeIn();
          $(".hide-menu-apptim-version").fadeIn();
          $(".hide-menu-button").fadeIn();
        }
      );
    });

    $("#side-menu li a").click(function () {
      $("#side-menu li a").removeClass("active");
      $("#side-menu li a .menu-selected").hide();

      if ($(".navbar-static-side").width() > 60) {
        $(this).find(".menu-selected").show();
      }
      $(this).addClass("active");
      $(this).addClass("icon-selected");
    });

    $(".tab-navigation li a").click(function () {
      $(this).addClass("icon-selected");
      $(".tab-navigation li a .tab-image").each(function () {
        var src = $(this).attr("src").replace("-hover", "");
        $(this).attr("src", src);
      });

      var src = $(this)
        .find(".tab-image")
        .attr("src")
        .replace(".png", "-hover.png");
      $(this).find(".tab-image").attr("src", src);
    });
  }

  //Setting the correct height for every screen for the container
  $("#page-wrapper").css("min-height", $(window).height() + "px");

  //Position of the hide menu
  var height_screen = $(window).height();
  $(".hide-menu").show();
  if (height_screen > 550) {
    $(".hide-menu").css("bottom", "-" + (height_screen - 100) + "px");
  } else {
    $(".hide-menu").css("bottom", "-" + 450 + "px");
  }

  $("#wrapper").css("height", height_screen - 30 + "px");

  $(".logo-sidebar").center({
    against: ".hide-menu",
    top: 1,
  });

  if ($(window).width() <= 768) {
    $(".nav-tabs").center({
      against: ".content-tabs",
      top: 1,
    });
  }
}

function unveilImg() {
  // What is this?
  $("img").unveil();
}

function fadeOutBlockLoader() {
  $("#block_loader").fadeOut();
}

function checkHashStatus() {
  $(window).on("hashchange", fireHashChanged);
  fireHashChanged();
}

function fireHashChanged() {
  if ($(".navbar-toggle").is(":visible")) {
    if ($(".sidebar-collapse").hasClass("in")) {
      $(".navbar-toggle").click();
    }
  }

  var hashes = window.location.hash.slice(1).split("&", 2);
  var hash = hashes[0];
  var secondary_hash = hashes[1];

  $("html, body").scrollTop(0);

  let anchor = "";
  if (typeof hashes[1] != "undefined") anchor = hashes[1];

  // Set default page shown
  if (hash == "") {
    hash = "summary";
  }
  if (hash.indexOf("_") > 0) {
    hash_format = hash.split("_");
    hash = hash_format[0];
    hash_format.shift();
    state.deviceInfo.id_uid = hash_format.join("_");
  }
  if (state.deviceInfo.id_uid == "") {
    device_list = $(".devices_list");
    var previousHash = window.location.hash;
    window.location.hash = $(device_list[0])
      .attr("href")
      .replace("device", hash);
    if (!previousHash) {
      fireHashChanged();
      return;
    }
  }
  $(".monkop_page").hide();
  $("#page_" + hash).fadeIn();

  $("#page_" + hash + " img").trigger("unveil");

  navhash = hash;
  switch (hash) {
    case "devices":
      $("#page_device .collapse.in").collapse("hide");
      loadDevices();
      break;
    case "device":
      // Init section
      navhash = "devices";
      $("#page_device .collapse.in").collapse("hide");
      setupExecutionInformation();
      try {
        const path = getLogFilePath("db_sql.tsv");
        $.get(
          path,
          function (data) {
            if (validateTsvFile(data)) $("#panelLogs_Database").show();
            else $("#panelLogs_Database").hide();
          }
        );
      } catch (error) {
        catchException("trying to obtain db_sql.tsv", error);
       }

      break;
    case "logs":
    case "resource":
    case "environment":
    case "bug":
    case "summary":
      $("#page_device .collapse.in").collapse("hide");
      if (hash == "bug") {
        const bug_id = secondary_hash;
        if (bug_id) {
          setTimeout(
            () => scrollToElementById("bug_section_" + bug_id, 90),
            500
          );
        }
      }
      break;
    default:
      if (state.deviceInfo.id_uid != "") {
        setTimeout(() => scrollToAnchor(state.deviceInfo.id_uid), 500);
      }
  }

  $("ul.nav").find(".active").removeClass("active");
  $("#nav_" + navhash).addClass("active");

  //updateContextHelpMenu(state.contextualHelpMenu, hash, getDeviceOs());
}
