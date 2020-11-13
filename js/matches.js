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
        requestMatchesInfo();
    });

    function setMatchesTitle() {
        var title = $('#matches-title');
        if (App.session['custom:provider'] == "true") {
            title.append('My Recipients');
        }
        else {
            title.append('My Providers');
        }
    }

    function requestMatchesInfo() {
        var body = { };
        if (App.session['custom:provider'] == "true") {
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
        var isProvider = App.session['custom:provider'] == "true";
        if (isProvider) {
            matches = result['Recipients'];
        }
        else {
            matches = result['Providers'];
        }

        var isMatchProvider = !isProvider;
        table = $('#matches-table');

        matches.forEach(match => {                
            var id;
            if (isMatchProvider) {
                id = match.ProviderId;
            }
            else {
                id = match.RecipientId;
            }
            var matchId = match.MatchId;
            var nameAnchorId = match.MatchId + '_name';
            var nameCell = '<td><a id=\"' + nameAnchorId + '\" href=\"#\">' + match.UserName + '</a></td>';
            var removeAnchorId = match.MatchId + '_remove';
            var removeCell = '<td><a id=\"' + removeAnchorId + '\" href=\"#\">Remove</a></td>';
            table.append('<tr>' + nameCell + removeCell + '</tr>');

            $('#' + nameAnchorId).click(createOnNameClick(id, isMatchProvider));
            $('#' + removeAnchorId).click(createOnRemoveClick(matchId));
        });
    }

    function createOnNameClick(userId, isProvider) {
        return function() {
            localStorage.setItem('UserId', userId);
            var page;
            if (isProvider) {
                page = 'provider';
            }
            else {
                page = 'recipient';
            }
            window.location.href = 'profile_' + page + '.html';
        };
    }

    function createOnRemoveClick(matchId) {
        return function() {
            body = { MatchId: matchId };
            jQuery.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/delete-match',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify(body),
                contentType: 'application/json',
                success: function success() { window.location.href = ''; },
                error: function error(jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                }
            })
        };
    }


}(jQuery));
