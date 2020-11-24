/*global App _config*/

var App = window.App || {};
var AppId;


function clickUser(profileId, isProvider) {
    var page;
    if (isProvider) {
        page = 'provider';
    }
    else {
        page = 'recipient';
    }
    window.location.href = 'profile_' + page + '.html?ProfileId=' + profileId;
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
        var body = {};
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
            var providerId;
            var recipientId;
            if (isListedUserProvider) {
                id = user.ProviderId;
                providerId = user.ProviderId;
                recipientId = App.session.sub;
            }
            else {
                id = user.RecipientId;
                recipientId = user.RecipientId;
                providerId = App.session.sub;
            }
            var nameAnchorId = id + '_name';
            var nameCell = '<td><a id=\"' + nameAnchorId + '\" href=\"#\">' + user.UserName + '</a></td>';
            var addAnchorId = id + '_add';
            var addCell = '<td></td>';
            if (!user.IsMatch) {
                addCell = '<td><a id=\"' + addAnchorId + '\" href=\"#\">Add</a></td>';
            }
            table.append('<tr>' + nameCell + addCell + '</tr>');

            $('#' + nameAnchorId).click(createOnNameClick(id, isListedUserProvider));
            $('#' + addAnchorId).click(createOnAddClick(providerId, recipientId));
            // table.append('<tr><td><a href=\'javascript:clickUser(\"' + id + '\", ' + isListedUserProvider + ')\'>' + user.UserName + '</a></td></tr>');
        });
    }

    function createOnNameClick(profileId, isProvider) {
        return function () {
            var page;
            if (isProvider) {
                page = 'provider';
            }
            else {
                page = 'recipient';
            }
            window.location.href = 'profile_' + page + '.html?ProfileId=' + profileId;
        };
    }

    function createOnAddClick(providerId, recipientId) {
        return function () {
            // alert("ProviderId: " + providerId + " recipientId: " + recipientId);
            body = {
                MatchProviderId: providerId,
                MatchRecipientId: recipientId
            };
            jQuery.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/create-match',
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
