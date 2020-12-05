/*global App _config*/

var App = window.App || {};
var AppId;

(function AppScopeWrapper($) {
    var authToken;
    var session;
    var matchesResult;
    var reviewsResult;
    App.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = 'index.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = 'index.html';
    });
    App.session.then(s => session = s);

    $(function onDocReady() {
        setMatchesTitle();
        requestMatchesInfo();
    });

    function setMatchesTitle() {
        var title = $('#matches-title');
        if (session['custom:provider'] == "true") {
            title.append('My Recipients');
        }
        else {
            title.append('My Providers');
        }
    }

    function requestMatchesInfo() {
        var body = {};
        if (session['custom:provider'] == "true") {
            body.MatchProviderId = session.sub;
        }
        else {
            body.MatchRecipientId = session.sub;
        }
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/get-matches',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify(body),
            contentType: 'application/json',
            success: function (result) {
                matchesResult = result;
                requestReviewsInfo();
            },
            error: function error(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        })
    }

    function requestReviewsInfo() {
        var body = { ReviewerId: session.sub };
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/get-reviews',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify(body),
            contentType: 'application/json',
            success: function (result) {
                reviewsResult = result;
                updateTable();
            },
            error: function error(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        })
    }

    function updateTable() {
        var matches;
        var isProvider = session['custom:provider'] == "true";
        if (isProvider) {
            matches = matchesResult['Recipients'];
        }
        else {
            matches = matchesResult['Providers'];
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
            var reviewObject = getReviewObject(id, matchId);
            table.append('<tr>' + nameCell + reviewObject.ReviewCell + removeCell + '</tr>');

            $('#' + nameAnchorId).click(createOnNameClick(id, isMatchProvider));
            $('#' + removeAnchorId).click(createOnRemoveClick(matchId));
            $('#' + reviewObject.AddReviewAnchorId).click(createOnReviewClick(id, reviewObject.MatchReviewId));
            if (reviewObject.DeleteReviewAnchorId != null) {
                $('#' + reviewObject.DeleteReviewAnchorId).click(createOnDeleteReviewClick(reviewObject.MatchReviewId));
            }
        });
        $('.spinner').hide();
        $('.content').show();
    }

    function getReviewObject(id, matchId) {
        var matchReviewId;
        reviewsResult['Reviews'].forEach((review) => {
            if (review['RevieweeId'] == id) {
                matchReviewId = review['ReviewId'];
            }
        });

        var reviewAnchorId = matchId + '_review';
        var reviewDeleteAnchorId;
        if (matchReviewId == null) {
            reviewCell = '<td><a id=\"' + reviewAnchorId + '\" href=\"#\">Add Review</a></td>';
        }
        else {
            reviewDeleteAnchorId = matchId + '_deletereview';
            reviewCell = '<td><a style=\"padding-right:20px;\" id=\"' + reviewAnchorId + '\" href=\"#\">Change Review</a><a id=\"' + reviewDeleteAnchorId + '\" href=\"#\">Delete Review</a></td >';
        }

        reviewObject = {
            ReviewCell: reviewCell,
            MatchReviewId: matchReviewId,
            AddReviewAnchorId: reviewAnchorId,
            DeleteReviewAnchorId: reviewDeleteAnchorId
        };
        return reviewObject;
    }

    function createOnReviewClick(id, matchReviewId) {
        return function () {
            var link;
            if (matchReviewId != null) {
                link = 'create_review.html?ReviewId=' + matchReviewId;
            }
            else {
                link = 'create_review.html?RevieweeId=' + id;
            }
            window.location.href = link;
        };
    }

    function createOnDeleteReviewClick(matchReviewId) {
        return function () {
            body = { ReviewId: matchReviewId };
            jQuery.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/delete-review',
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

    function createOnRemoveClick(matchId) {
        return function () {
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
