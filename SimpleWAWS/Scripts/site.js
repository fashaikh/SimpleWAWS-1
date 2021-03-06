﻿var Template = (function () {
    function Template(json) {
        this.name = json.Name;
        this.fileName = json.FileName;
        this.language = json.Language;
        this.icon_class = json.IconClass;
        this.appService = json.AppService;
    }
    Template.prototype.select = function (event) {
        $(".website-template-container").removeClass("box-container-selected");
        var parent = $(event.target).closest(".website-template-container").addClass("box-container-selected");
        viewModel.selectedTemplate(this);
    };
    return Template;
})();

var Site = (function () {
    function Site() {
    }
    return Site;
})();

var viewModel;



//http://stackoverflow.com/a/901144/3234163
function getQueryStringBytName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i"),
        results = regex.exec(location.search);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function initViewModel() {
    viewModel = this;
    viewModel.siteJson = ko.observable();
    viewModel.errorMessage = ko.observable();
    viewModel.selectedLanguage = ko.observable();
    viewModel.selectedTemplate = ko.observable();
    viewModel.templates = ko.observableArray();
    // for now Mobile has only 1 template. If this changes, we will need to have actual template array for Mobile as well.
    viewModel.mobileTemplates = ko.observableArray();
    viewModel.timeLeft = ko.observable();
    viewModel.createRunning = ko.observable(false);
    viewModel.languages = ko.computed(function () {
        var languages = ko.utils.arrayMap(viewModel.templates(), function (item) {
            return item.language;
        });
        return ko.utils.arrayGetDistinctValues(languages).sort(defaultSort);
    });
    viewModel.selectLanguage = function (e) {
        if (typeof e === "string") {
            viewModel.selectedLanguage(e);
        } else if (e) {
            viewModel.selectedLanguage($(e.target).text());
        }
        if (viewModel.selectedTemplate() && viewModel.selectedTemplate().language === viewModel.selectedLanguage()) {
            selectTemplate(viewModel.selectedTemplate());
        } else {
            $(".select-template-anchor").first().click();
        }
    };
    viewModel.appServices = ko.observableArray([{
        label: "web app",
        name: "Web",
        id: 0,
        icon_url: "/Content/images/Azure Websites.png",
        sprite_class: "sprite-AzureWebsites"
    }, {
        label: "mobile app",
        name: "Mobile",
        id: 1,
        icon_url: "/Content/images/Mobile Services.png",
        sprite_class: "sprite-MobileServices"
    }, {
        label: "API app",
        name: "Api",
        id: 2,
        sprite_class: "sprite-APIApps"
    }, {
        label: "logic app",
        name: "Logic",
        id: 3,
        sprite_class: "sprite-LogicApp"
    }]);
    viewModel.appServices().map(function (e) {
        e.select = function (event) {
            $(".appservice-container").removeClass("box-container-selected");
            var parent = $(event.target).closest(".appservice-container").addClass("box-container-selected");
            viewModel.selectedAppService(e);
        };
    });
    viewModel.selectedAppService = ko.observable(viewModel.appServices()[0]);
    viewModel.mobileClients = ko.observableArray([{
        name: "Windows",
        icon_url: "/Content/images/Windows.png",
        icon_class: "sprite-Windows",
        steps: {
            preText: "Install Visual Studio Professional 2013 (Update 4)",
            preHref: "https://go.microsoft.com/fwLink/?LinkID=391934&clcid=0x409",
            clientText: "Download the Windows client app",
            clientHref: "/api/site/mobileclient/Windows"
        }
    }, {
        name: "Native iOS",
        icon_url: "/Content/images/ios.png",
        icon_class: "sprite-ios",
        steps: {
            preText: "Install Xcode (v4.4+)",
            preHref: "https://go.microsoft.com/fwLink/?LinkID=266532&clcid=0x409",
            clientText: "Download the iOS client app",
            clientHref: "/api/site/mobileclient/NativeiOS"
        }

    }, {
        name: "Xamarin iOS",
        icon_url: "/Content/images/xamarin.png",
        icon_class: "sprite-Xamarin",
        steps: {
            preText: "Install Xamarin Studio for Windows or OS X",
            preHref: "https://go.microsoft.com/fwLink/?LinkID=330242&clcid=0x409",
            clientText: "Download the Xamarin iOS client app",
            clientHref: "/api/site/mobileclient/XamariniOS"
        }

    }, {
        name: "Xamarin Android",
        icon_url: "/Content/images/xamarin.png",
        icon_class: "sprite-Xamarin",
        steps: {
            preText: "Install Xamarin Studio for Windows or OS X",
            preHref: "https://go.microsoft.com/fwLink/?LinkID=330242&clcid=0x409",
            clientText: "Download the Xamarin Android client app",
            clientHref: "/api/site/mobileclient/XamarinAndroid"
        }
    }]);
    viewModel.selectedMobileClient = ko.observable(viewModel.mobileClients()[0]);
    viewModel.mobileClients().map(function (e) {
        e.select = function (event) {
            viewModel.selectedMobileClient(this);
        };
    });
    ko.applyBindings(viewModel);
}

function initTemplates() {
    return $.getJSON("/api/templates", function (data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].AppService.toUpperCase() === "WEB") {
                viewModel.templates.push(new Template(data[i]));
            } else if (data[i].AppService.toUpperCase() === "MOBILE") {
                var temp = new Template(data[i]);
                temp.icon_class = "sprite-todolist";
                viewModel.mobileTemplates.push(temp);
            }
        }
    }).done(function () {
        viewModel.templates.sort(helloSort);
        if (viewModel.templates().length > 0) {
            viewModel.selectLanguage(getCorrectDefaultLanguage(viewModel.languages()));
            $("option.wa-dropdown-language-option[value='" + getCorrectDefaultLanguage(viewModel.languages()) + "']").prop('selected', true);
        }
    });
}

function defaultSort(a, b) {
    if (a.toUpperCase() === "DEFAULT") {
        return -1;
    } else if (b.toUpperCase() === "DEFAULT") {
        return 1;
    }
    else {
        return a.localeCompare(b);
    }
}

function helloSort(a, b) {
    if (a.name.toUpperCase().indexOf("HELLO") !== -1) {
        return -1;
    } else if (b.name.toUpperCase().indexOf("HELLO") !== -1) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
}

function getCorrectDefaultLanguage(languages) {
    var result = getQueryStringBytName("language");
    if (result === undefined) {
        return languages[0];
    } else {
        result = result.toUpperCase();
        for (var i = 0; i < languages.length; i++) {
            if (languages[i].toUpperCase() === result) {
                return languages[i];
            }
        }
        return languages[0];
    }
}

function initSite() {
    toggleSpinner();
    return $.ajax({
        type: "GET",
        url: "/api/site",
        data: "",
        contentType: "application/json; charset=utf-8",
        success: handleGetSite,
        error: handleGetSiteError
    });
}

var currentTimeout = 0;
function startCountDown(init) {
    if (init !== undefined) {
        var reg = '(\\d+)(m)?(:)(\\d+)(s)?';
        var pattern = new RegExp(reg, "i");
        var match = pattern.exec(init);
        var expireDateTime = new Date();
        expireDateTime.setMinutes(expireDateTime.getMinutes() + parseInt(match[1]));
        expireDateTime.setSeconds(expireDateTime.getSeconds() + parseInt(match[4]));
        countDown(expireDateTime);
    }
}

function countDown(expireDateTime) {
    if (viewModel.siteJson() != undefined) {
        var now = new Date();
        var diff = expireDateTime - now;
        if (diff <= 0) {
            viewModel.timeLeft("00m:00s");
            $("#site-expired").show();
            return;
        }
        diff = diff / 1000;
        viewModel.timeLeft(("0" + Math.floor(diff / 60)).slice(-2) + "m:" + ("0" + Math.floor(diff % 60)).slice(-2) + "s");
        currentTimeout = setTimeout(countDown, 1000, expireDateTime);
    }
}

function deleteSite(event) {
    if (event) {
        event.preventDefault();
    }
    viewModel.siteJson(undefined);
    scrollToTop();
    return $.ajax({
        type: "DELETE",
        url: "/api/site"
    })
}

function toggleSpinner() {
    $(".error-message").hide();
    viewModel.createRunning(!viewModel.createRunning());
}

function scrollSitePartToView() {
    if (viewModel.selectedAppService().id === 0 /*Web*/) {
        scrollHelper($("#work-with-your-site").offset().top - 170);
    } else if (viewModel.selectedAppService().id === 1 /*Mobile*/) {
        scrollHelper($("#build-run-your-mobile-app").offset().top - 170);
    }
}

function scrollToTop() {
    scrollHelper(0);
}

function scrollHelper(index) {
    $("html, body").animate({
        scrollTop: index
    }, 900);
}

function handleGetSite(data) {
    toggleSpinner();
    $("#create-site").show();
    if (data != null) {
        viewModel.siteJson(data);
        pickAppService(data.appService);
        startCountDown(viewModel.siteJson().timeLeftString);
        scrollSitePartToView();
    } else {
        viewModel.siteJson(undefined);
    }
}

function handleGetApi(data) {
    toggleSpinner();
}

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function handleGetSiteError(xhr, error, errorThrown) {
    toggleSpinner();
    if (xhr.status === 403) {
        // This is expected if we are not logged in.
        //  Disable create, and show login
        return;
    }
    handleGenericHttpError(xhr, error, errorThrown);
}

function handleCreateSiteError(xhr, error, errorThrown, source) {
    if (xhr.status === 403 && !source) {
        //this means user is not loged in, and hasn't selected a login yet
        toggleSpinner();
        $('.login-box').fadeIn(600);
        $('#login-dark-blocker').show();
    } else if (xhr.status === 403 && xhr.getResponseHeader("LoginUrl") !== null) {
        window.location = xhr.getResponseHeader("LoginUrl");
    } else {
        toggleSpinner();
        handleGenericHttpError(xhr, error, errorThrown);
    }
}

function handleGenericHttpError(xhr, error, errorThrown) {
    if (xhr.responseText) {
        var serverError = isJSON(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText;
        viewModel.errorMessage(serverError.ExceptionMessage ? serverError.ExceptionMessage : serverError.Message);
    } else {
        viewModel.errorMessage("There was an error");
    }
    $(".error-message").show();
}

function freeTrialClick() {
    telemetryEvent("FreeTrialClick");
}

function telemetryEvent(event) {
    $.ajax({
        type: "POST",
        url: "/api/telemetry/" + event
    });
}

function checkForEnterKey(event, searchBoxId) {
    if (event.keyCode === 13 /*Enter key*/) {
        doSearch(searchBoxId);
    }
}

function doSearch(searchBoxId) {
    var baseUrl = "http://azure.microsoft.com/en-us/searchresults/?query=";
    var searchItems = encodeURIComponent($("#" + searchBoxId).val());
    window.location.href = baseUrl + searchItems;
}

function createSite(template, source) {
    var appService = viewModel.selectedAppService();
    if (appService.id == 1 /*mobile*/) {
        template = viewModel.mobileTemplates()[0];
    } else if (!template) {
        template = viewModel.selectedTemplate();
    }

    toggleSpinner();
    return $.ajax({
        type: "POST",
        url: "/api/site?language=" + encodeURIComponent(template.language) + (source ? "&provider=" + source + "&name=" + encodeURIComponent(template.name) : "") + "&appServiceName=" + appService.name.split(" ")[0] + "&autoCreate=true",
        data: JSON.stringify(template),
        contentType: "application/json; charset=utf-8",
        success: handleGetSite,
        error: function (xhr, error, errorThrown) { handleCreateSiteError(xhr, error, errorThrown, source); }
    });
}

function handleApi2(event) {
    createApiApp('TrySamplesContactList');
}

function handleApi1(event) {
    createApiApp('TrySamplesTodoList');
}

function createApiApp(name) {
    toggleSpinner();
    return $.ajax({
        type: "POST",
        url: "/api/site",
        data: JSON.stringify({
            Name: name,
            AppService: "Api",
            Language: "blah"
        }),
        contentType: "application/json; charset=utf-8",
        success: handleGetApi,
        error: function (xhr, error, errorThrown) { handleCreateSiteError(xhr, error, errorThrown, "AAD"); }
    });
}

function getSiteToCreate() {
    var language = getQueryStringBytName("language");
    var templateName = getQueryStringBytName("name");
    var appService = getQueryStringBytName("appServiceName");
    if (language !== undefined && templateName !== undefined)
        return {
            name: templateName,
            language: language,
            appService: appService
        };
}

function isCreateSite() {
    return getSiteToCreate() !== undefined;
}

function clearQueryString() {
    if (history.pushState) {
        var language = getQueryStringBytName("language");
        if (language) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?language=' + encodeURIComponent(language);
            window.history.pushState({ path: newurl }, '', newurl);
        }
    }
}

function selectTemplate(template, clearSelection) {
    if (clearSelection) $(".website-template-container").removeClass("box-container-selected");
    $("#templates-div")
        .find("." + template.name.replace(/\s/g, "").replace(/\./g, "\\."))
        .closest(".website-template-container")
        .addClass("box-container-selected");
}

function gitUrlClick(event) {
    event.preventDefault();
    $('#git-url-input').select();
}

function handleCreateClick(event, source) {
    event.preventDefault();
    createSite(undefined, source);
}

function pickAppService(name) {
    name = (name ? name : getQueryStringBytName("appServiceName"));
    name = (name ? name.toUpperCase() : name);
    switch (name) {
        case "MOBILE":
            viewModel.selectedAppService(viewModel.appServices()[1]);
            break;
        case "WEB":
        default:
            viewModel.selectedAppService(viewModel.appServices()[0]);
    }
}

$(document).ready(function () {
    initViewModel();
    pickAppService();
    initTemplates().done(function () {
        if (isCreateSite()) {
            var template = getSiteToCreate();
            if (template.appService.toUpperCase() === "WEB") {
                viewModel.selectedTemplate(template);
                selectTemplate(template, true);
            }
            if (getQueryStringBytName("autoCreate")) {
                createSite(template).error(function () { initSite().always(function () { $(".error-message").show(); }); });
            }
        } else {
            initSite();
        }
        clearQueryString();
    });

    $("select").on("change", function (e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        viewModel.selectLanguage(valueSelected);
    });

    $("#dismiss-site-expire").click(function (e) {
        e.preventDefault();
        deleteSite();
        $("#site-expired").hide();
    });

    $(document).mouseup(function (e) {
        var container = $(".login-box");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.fadeOut(300);
            $('#login-dark-blocker').hide();
        }
    });
});

if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
