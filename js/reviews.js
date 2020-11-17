/*global App _config*/

var App = window.App || {};
var AppId;

(function AppScopeWrapper($) {
    var ReviewId;
    var RevieweeId;
    var StarRating;
    var ReviewText;
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
        getPageParams();
        requestReviewInfo();
    });

    function getPageParams() {
        RevieweeId = localStorage.getItem("RevieweeId");
        ReviewerId = localStorage.getItem("ReviewerId");
        RevieweeId = "3333";
    }

    function requestReviewInfo() {
        if (RevieweeId != null) {
            var body = {
                RevieweeId: RevieweeId
            };
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/get-reviews',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify(body),
                contentType: 'application/json',
                success: updateReviews,
                error: function error(jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                }
            });
        }
    }

    function updateReviews(result) {
        var reviewsList = $('#reviews-list');
        result['Reviews'].forEach(review => {
            alert(JSON.stringify(review));
            var ReviewerUsername = review['ReviewerUser']['UserName'];
            var ReviewText = review['Review'];
            var StarRating = review['Rating'];

            var reviewerUsernameItem = '<h2>' + ReviewerUsername + '</h2>';

            var highlightedStarsText = '';
            var unhighlightedStarsText = '';
            for (var i = 0; i < 5; i++) {
                if (i < StarRating) {
                    highlightedStarsText += '&starf;';
                } else {
                    unhighlightedStarsText += '&starf;';
                }
            }
            var highlightedStars = '<div class=\"rating-selected rating\">' + highlightedStarsText + '</div>';
            var unhighlightedStars = '<div class=\"rating\">' + unhighlightedStarsText + '</div>';
            var reviewRatingItem = '<p>' + highlightedStars + unhighlightedStars + '</p>';

            var reviewTextItem = '<p>' + ReviewText + '</p>';
            var reviewItem = '<div class=\"review-item\">' + reviewerUsernameItem + reviewRatingItem + reviewTextItem + '</div>';
            reviewsList.append(reviewItem);
        });
    }
}(jQuery));