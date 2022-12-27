/* MultiServiceMap.
   Copyright (C) 2022 DISIT Lab http://www.disit.org - University of Florence

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, either version 3 of the
   License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. */
   
var Authentication = {
    registerUrl: "https://www.snap4city.org/drupal/api/user/register",
    url: "https://www.snap4city.org/auth/",
    clientId: "js-snap4city-mobile-app",
    logged: false,
    keycloak: null,

    open: false,
    registerPageOpen: false,
    anonymousPageOpen: false,

    init: function () {
        if (Authentication.keycloak == null) {
            Authentication.keycloak = Keycloak({
                "realm": "master",
                "url": Authentication.url,
                "clientId": Authentication.clientId
            });
        }
    },

    login: function () {
        Authentication.init();
        Authentication.keycloak.init({
            onLoad: 'login-required'
        }).success(
            function (authenticated) {
                console.log(authenticated);
                if (authenticated) {
                    Authentication.successAuthentication();
                } else {
                    Authentication.keycloak.login();
                }
            }).error(function () {
                navigator.notification.alert(Globalization.alerts.connectionLoginError.message, function () {}, Globalization.alerts.connectionLoginError.title);
            });
    },

    checkLogin: function () {

        Authentication.init();

        Authentication.keycloak.init({
            onLoad: 'check-sso'
        }).success(
            function (authenticated) {
                console.log(authenticated);
                if (authenticated) {
                    if (localStorage.getItem("buttonCallback") != null) {
                        Authentication.callbackTimeout = 2000;
                        Authentication.checkAuthorizationButton(eval("(" + localStorage.getItem("buttonCallback") + ")"));
                    }
                    Authentication.successAuthentication();
                    Tracker.sendInformation();
                    PrincipalMenu.sendInformation();
                } else {
                    Authentication.show();
                }
            }).error(function (e) {
                //navigator.notification.alert(Globalization.alerts.connectionLoginError.message, function () {}, Globalization.alerts.connectionLoginError.title);
            if (PrincipalMenu.fromPrincipalMenu) {
                Authentication.show();
            }
        });
    },

    checkAuthorizationButton: function (callback) {

        Authentication.init();

        PrincipalMenu.fromPrincipalMenu = true;

        if (device.platform == "Android" || device.platform == "iOS") {
            Authentication.keycloak.init({
                onLoad: 'check-sso'
            }).success(
                function (authenticated) {
                    console.log(authenticated);
                    if (authenticated) {
                        EngagerManager.updateLastLogin();
                        EngagerManager.checkUserProfile();
                        EngagerManager.checkUserLanguage();
                        callback();
                    } else {
                        Authentication.show();
                    }
                }).error(function () {});
        } else if (device.platform == "Web") {
            Authentication.keycloak.updateToken(30).success(function () {
                setTimeout(function () {
                    callback();
                }, Authentication.callbackTimeout);
                Authentication.callbackTimeout = 0;
                localStorage.removeItem("buttonCallback");
            }).error(function () {
                localStorage.setItem("buttonCallback", callback);
                Authentication.checkLogin();
            });
        }
    },

    successAuthentication: function () {
        console.log("AUTHENTICATED");
        $("#navbarBottomLoginButton").hide();
        $("#navbarBottomLogoutButton").show();
        $(".captionAuthenticated").parent().hide();
        Authentication.logged = true;
        EngagerManager.updateLastLogin();
        EngagerManager.checkUserProfile();
        EngagerManager.checkUserLanguage();
        Authentication.hide();
    },

    logout: function () {
        $("#navbarBottomLoginButton").show();
        $("#navbarBottomLogoutButton").hide();
        $(".captionAuthenticated").parent().show();
        $(".captionAuthenticated").attr("data-icon", "lock");
        $(".captionAuthenticated").css("color", "darkred");
        Authentication.logged = false;
        Authentication.keycloak.logout();

        //TODO a Notify-Subscribe Architecture
        Tracker.S4CTrackerLocationID = null;
        localStorage.removeItem('savedLocation');
        PrincipalMenu.S4CAppUsageID = null;
        localStorage.removeItem('savedUsages');
        PrincipalMenu.resetPersonalAssistantBadge();
        EngagerManager.username = null;
        EngagerManager.userProfile = null;
        EngagerManager.enableAssistant = false;
        EngagerManager.enableTrackerLocation = false;

    },

    show: function () {
        if ($("#authentication").length == 0) {
            $("#indexPage").append("<div id=\"authentication\"></div>")
        }
        if (device.platform != "Web") {
            $.ajax({
                url: RelativePath.jsonFolder + "authMethods.json",
                async: false,
                cache: false,
                dataType: "json",
                success: function (data) {

                    ViewManager.render(data, '#authentication', 'Authentication');
                }
            });
        } else {
            ViewManager.render(null, '#authentication', 'Authentication');
        }

        $('#authentication').show();
        Authentication.open = true;
        application.addingMenuToCheck("Authentication");
    },

    hide: function () {
        $('#authentication').css('display','none')
         $('#authentication').remove();
        Authentication.open = false;
       application.removingMenuToCheck("Authentication");
         if (!PrincipalMenu.fromPrincipalMenu) {
             if (device.platform != "Web") {
                 screen.orientation.unlock();
             }
         localStorage.setItem("acceptInformation", true);
            localStorage.setItem("appVersion", application.version);
             application.startingApp();
         }
    },

    checkForBackButton: function () {
        if (Authentication.open) {
            if (Authentication.registerPageOpen) {
                Authentication.hideRegisterPage();
            } else if (Authentication.anonymousPageOpen) {
                Authentication.hideAnonymousPage();
            } else {
                if (PrincipalMenu.fromPrincipalMenu) {
                    Authentication.hide();
                }
            }
        }
    },

    showAnonymousPage: function () {
        localStorage.removeItem("buttonCallback");
      if (!PrincipalMenu.fromPrincipalMenu) {
            $("#loginButton").hide();
            $("#registerButton").hide();
            $("#anonymousButton").hide();
            $("#closeButton").hide();
            $("#privacyPolicyCheckboxContainer").show();
            $("#enterAsAnonymousButton").show();
            $("#backToLoginButton").show();
            Authentication.anonymousPageOpen = true; 
        } else {
            Authentication.hide();
        }
    },

    hideAnonymousPage: function () {
        $("#loginButton").show();
        $("#registerButton").show();
        $("#anonymousButton").show();
        $("#closeButton").show();
        $("#privacyPolicyCheckboxContainer").hide();
        $("#enterAsAnonymousButton").hide();
        $("#backToLoginButton").hide();
        Authentication.anonymousPageOpen = false;
    },

    showRegisterPage: function () {
        $("#loginButton").hide();
        $("#registerButton").hide();
        $("#closeButton").hide();
        $("#anonymousButton").hide();
        $("#privacyPolicyCheckboxContainer").show();
        $("#cookiesPolicyCheckboxContainer").show();
        $("#termsOfUseCheckboxContainer").show();
        $("#nameInput").show();
        $("#emailInput").show();
        $("#nameInput").parent().show();
        $("#emailInput").parent().show();
        $("#sendButton").show();
        $("#backToLoginButton").show();
        Authentication.registerPageOpen = true;
    },

    hideRegisterPage: function () {
        $("#loginButton").show();
        $("#registerButton").show();
        $("#closeButton").show();
        $("#anonymousButton").show();
        $("#privacyPolicyCheckboxContainer").hide();
        $("#cookiesPolicyCheckboxContainer").hide();
        $("#termsOfUseCheckboxContainer").hide();
        $("#nameInput").parent().hide();
        $("#emailInput").parent().hide();
        $("#sendButton").hide();
        $("#backToLoginButton").hide();
        Authentication.registerPageOpen = false;
    },

    sendInfo: function () {
        Authentication.registration();
    },

    backToLogin: function () {
        $('#privacyPolicyCheckbox').parent().children("strong").css("color", "black");
        $('#privacyPolicyCheckbox').parent().children("span").css("color", "black");
        $('#cookiesPolicyCheckbox').parent().children("strong").css("color", "black");
        $('#cookiesPolicyCheckbox').parent().children("span").css("color", "black");
        $('#termsOfUseCheckbox').parent().children("strong").css("color", "black");
        $('#termsOfUseCheckbox').parent().children("span").css("color", "black");

        if (Authentication.registerPageOpen) {
            Authentication.hideRegisterPage();
        } else if (Authentication.anonymousPageOpen) {
            Authentication.hideAnonymousPage();
        }
    },

    checkEmail: function (makeAlert) {
        var emailRegex = /^(\w+)(.{0,1})(\w+)(\@)(\w+)\.(\w{1,3})$/;
        if (emailRegex.test($("#emailInput").val())) {
            $("#emailInput").css("border", "4px solid #3c763d");
            $("#emailInput").css("color", "#3c763d");
            $("#emailSuccess").show();
            $("#emailWarning").hide();
            $("#emailDanger").hide();
            return true;
        } else {
            if (makeAlert != false) {
                navigator.notification.alert(Globalization.alerts.wrongEmail.message, function () {}, "");
            }
            $("#emailInput").css("border", "4px solid #a94442");
            $("#emailInput").css("color", "#a94442");
            $("#emailSuccess").hide();
            $("#emailWarning").hide();
            $("#emailDanger").show();
        }
        return false;
    },
    checkName: function (makeAlert) {
        if ($("#nameInput").val() != "") {
            $("#nameInput").css("border", "4px solid #3c763d");
            $("#nameInput").css("color", "#3c763d");
            $("#nameSuccess").show();
            $("#nameWarning").hide();
            $("#nameDanger").hide();
            return true;
        } else {
            if (makeAlert != false) {
                navigator.notification.alert(Globalization.alerts.emptyname.message, function () {}, "");
            }
            $("#nameInput").css("border", "4px solid #a94442");
            $("#nameInput").css("color", "#a94442");
            $("#nameSuccess").hide();
            $("#nameWarning").hide();
            $("#nameDanger").show();
        }
        return false;
    },

    checkEmptyInput: function (element, makeAlert) {
        if ($("#" + element + "Input").val() == "") {
            if (makeAlert != false) {
                navigator.notification.alert(Globalization.alerts["empty" + element].message, function () {}, "");
            }
            $("#" + element + "Input").css("border", "4px solid #8a6d3b");
            $("#" + element + "Input").css("color", "black");
            $("#" + element + "Success").hide();
            $("#" + element + "Warning").show();
            $("#" + element + "Danger").hide();
            return false;
        }
        return true;
    },

    checkPolicyAnonymous: function () {
        if (!$('#privacyPolicyCheckbox').is(':checked')) {
            $('#privacyPolicyCheckbox').parent().children("strong").css("color", "red");
            $('#privacyPolicyCheckbox').parent().children("span").css("color", "red");
        } else {
            $('#privacyPolicyCheckbox').parent().children("strong").css("color", "black");
            $('#privacyPolicyCheckbox').parent().children("span").css("color", "black");
        }

        if ($('#privacyPolicyCheckbox').is(':checked')) {
            return true;
        }

        return false;

    },

    checkPolicy: function () {
        if (!$('#privacyPolicyCheckbox').is(':checked')) {
            $('#privacyPolicyCheckbox').parent().children("strong").css("color", "red");
            $('#privacyPolicyCheckbox').parent().children("span").css("color", "red");
        } else {
            $('#privacyPolicyCheckbox').parent().children("strong").css("color", "black");
            $('#privacyPolicyCheckbox').parent().children("span").css("color", "black");
        }
        if (!$('#cookiesPolicyCheckbox').is(':checked')) {
            $('#cookiesPolicyCheckbox').parent().children("strong").css("color", "red");
            $('#cookiesPolicyCheckbox').parent().children("span").css("color", "red");
        } else {
            $('#cookiesPolicyCheckbox').parent().children("strong").css("color", "black");
            $('#cookiesPolicyCheckbox').parent().children("span").css("color", "black");
        }
        if (!$('#termsOfUseCheckbox').is(':checked')) {
            $('#termsOfUseCheckbox').parent().children("strong").css("color", "red");
            $('#termsOfUseCheckbox').parent().children("span").css("color", "red");
        } else {
            $('#termsOfUseCheckbox').parent().children("strong").css("color", "black");
            $('#termsOfUseCheckbox').parent().children("span").css("color", "black");
        }

        if ($('#privacyPolicyCheckbox').is(':checked') && $('#cookiesPolicyCheckbox').is(':checked') && $('#termsOfUseCheckbox').is(':checked')) {
            return true;
        }

        return false;

    },

    enterAsAnonymous: function () {
        if (Authentication.checkPolicyAnonymous()) {
            Authentication.hideAnonymousPage();
            Authentication.hide();
        }

    },

    registration: function () {
        if (Authentication.checkEmptyInput("name")) {
            if (Authentication.checkEmptyInput("email")) {
                if (Authentication.checkEmail()) {
                    if (Authentication.checkPolicy()) {
                        if (application.checkConnection()) {
                            $("#loadingOverlayPage").show();
                            setTimeout(function () {
                                $.ajax({
                                    url: Authentication.registerUrl,
                                    method: "POST",
                                    async: true,
                                    contentType: "application/json",
                                    timeout: Parameters.timeoutAuthentication,
                                    data: JSON.stringify({
                                        "name": $("#nameInput").val(),
                                        "mail": $("#emailInput").val(),
                                        "legal_accept": $("#termsOfUseCheckbox").val(),
                                        "extras-1": $("#privacyPolicyCheckbox").val(),
                                        "extras-2": $("#cookiesPolicyCheckbox").val(),
                                        "og_user_node": {
                                            "und": [{
                                                "default": application.organizationCode
                                            }]
                                        }
                                    }),
                                    success: function (data) {
                                        console.log(data);
                                        if (data != null) {
                                            navigator.notification.alert(Globalization.alerts.successRegistration.message, function () {}, Globalization.alerts.successRegistration.title);
                                            Authentication.hideRegisterPage();
                                        }
                                    },
                                    error: function (data) {
                                        navigator.notification.alert(data.statusText, function () {}, "");
                                        Authentication.hideRegisterPage();
                                    },
                                    complete: function () {
                                        $("#loadingOverlayPage").hide();
                                    }
                                });
                            }, 100);
                        } else {
                            navigator.notification.alert(Globalization.alerts.connectionError.message, function () {}, Globalization.alerts.connectionError.title);
                        }
                    }
                }
            }
        }
    },

    redirectToRightPage: function () {
        PrincipalMenu.fromPrincipalMenu = true;
        if (Authentication.logged) {
            UserProfile.show();
        } else {
            Authentication.checkLogin();
        }
    },

    onKeyEnter: function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            if (Authentication.registerPageOpen) {
                Authentication.registration();
            } else {
                Authentication.login();
            }
            return false;
        }
        return true;
    }

}