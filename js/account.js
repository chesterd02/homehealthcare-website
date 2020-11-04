/*global App _config*/

var App = window.App || {};
var AppId;

(function AppScopeWrapper($) {
    var authToken;
    App.authToken.then(function setAuthToken(token) {
        if (token) {
            alert("Token: " + token);
            authToken = token;
        } else {
             window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });

    $(function onDocReady() {
        $('#showCredientials').click(getUserInfo);
        $('#request').click(somefunction);
        $('#changeAlias').click(handleAliasClick);
        $('#signOut').click(function () {
            App.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });
        App.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });
        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
        requestUserInfo();
    });

    function somefunction(){

    }
    function requestUserInfo() {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/getinfo',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured while retrieving your account info.');
                // alert('An error occurred when requesting your user Info:\n' + JSON.stringify(jqXHR));
            }
        });
    }

    //*****
    //*******HANDLE ALIAS CHANGE
    function handleAliasClick(event){
        event.preventDefault();
        var newAlias = prompt ("Enter your new Alias:")
        if (newAlias == null || newAlias == ""){
            alert("cancelled");
        }else{
            updateAlias(newAlias)
        }
    }
    function updateAlias(newAlias){
        alert('new alias will be: '+ newAlias);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/changealias',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                newAlias: newAlias
            }),
            contentType: 'application/json',
            success: requestUserInfo,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error updating alias: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when updating the alias.');
                // alert('An error occurred when updating alias:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result){
        alert(JSON.stringify(result));

        alert(JSON.stringify(result.matches))
        loop
        size
        displayUpdate("this is an update")
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
