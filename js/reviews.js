/*global App _config*/

var App = window.App || {};
var AppId;

(function AppScopeWrapper($) {
    var RevieweeId;
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
        const urlParams = new URLSearchParams(window.location.search);
        RevieweeId = urlParams.get('RevieweeId');
        ReviewerId = urlParams.get('ReviewerId');
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
        if (result['Reviews'].length == 0) {
            noReviewsItem = '<p>There are no reviews for this user yet.</p>';
            reviewsList.append(noReviewsItem);
        }
        else {
            result['Reviews'].forEach(review => {
                alert(JSON.stringify(review));
                var deleteReview = '';
                var deleteId = review['ReviewId'] + '_delete'
                if (review['IsMyReview'] == true) {
                    deleteReview = '<a id=\"' + deleteId + '\" href=\"#\">Delete Review</a>';
                }

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
                var reviewItem = '<div class=\"review-item\">' + deleteReview + reviewerUsernameItem + reviewRatingItem + reviewTextItem + '</div>';
                reviewsList.append(reviewItem);
                if (review['IsMyReview'] == true) {
                    $('#' + deleteId).click(createOnDeleteReviewClick(review['ReviewId']));
                }
            });
        }
    }

    function createOnDeleteReviewClick(reviewId) {
        return function() {
            body = { ReviewId: reviewId };
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
}(jQuery));