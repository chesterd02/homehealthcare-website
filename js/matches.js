/*global App _config*/

var App = window.App || {};
var AppId;

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
        setMatchesTitle();
        requestDatabaseInfo();
    });

    function setMatchesTitle() {
        var title = $('#matches-title');
        if (App.session['custom:provider']) {
            title.append('List of Recipients');
        }
        else {
            title.append('List of Providers');
        }
    }

    function requestDatabaseInfo() {
        var body = { };
        if (App.session['custom:provider']) {
            body.MatchProviderId = App.session.sub;
        }
        else {
            body.MatchRecipientId = App.session.sub;
        }
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/get-matches',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify(body),
            contentType: 'application/json',
            success: updateTable,
            error: function error(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        })
    }

    function updateTable(result) {
        var matches;
        if (App.session['custom:provider']) {
            matches = result['Recipients'];
        }
        else {
            matches = result['Providers'];
        }
        names = matches.map(match => match['UserName']);

        table = $('#matches-table');
        names.forEach(name => {                
            table.append('<tr><td><a href=\'\'>' + name + '</a></td></tr>');
        });
    }
}(jQuery));
