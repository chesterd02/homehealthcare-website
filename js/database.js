/*global App _config*/

var App = window.App || {};
var AppId;


function clickUser(userId, isProvider) {
    localStorage.setItem('UserId', userId);
    var page;
    if (isProvider) {
        page = 'provider';
    }
    else {
        page = 'recipient';
    }
    window.location.href = 'profile_' + page + '.html';
}

(function AppScopeWrapper($) {
    var authToken;
    App.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
             window.location.href = 'signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = 'signin.html';
    });

    $(function onDocReady() {
        setDatabaseTitle();
        requestDatabaseInfo();
        console.log(authToken);
    });

    function setDatabaseTitle() {
        var title = $('#database-title');
        if (App.session['custom:provider'] == "true") {
            title.append('Database of all Recipients');
        }
        else {
            title.append('Database of all Providers');
        }
    }

    function requestDatabaseInfo() {
        var body = { };
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/search-info',
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: updateTable,
            error: function error(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        })
    }

    function updateTable(result) {
        var users = result['Users'];
        var isProvider = App.session['custom:provider'] == "true";

        var isListedUserProvider = !isProvider;
        table = $('#database-table');

        users.forEach(user => {                
            var id;
            if (isListedUserProvider) {
                id = user.ProviderId;
            }
            else {
                id = user.RecipientId;
            }
            table.append('<tr><td><a href=\'javascript:clickUser(\"' + id + '\", ' + isListedUserProvider + ')\'>' + user.UserName + '</a></td></tr>');
        });
    }
}(jQuery));
