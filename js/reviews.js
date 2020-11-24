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
        if (RevieweeId != null || ReviewerId != null) {
            $("#reviews-written-title").hide();
            $("#reviews-written-list").hide();
            requestReviewInfo("RevieweeId", RevieweeId, "reviews-received-list", false);
        }
        else {
            var userId = App.session.sub;
            requestReviewInfo("RevieweeId", userId, "reviews-received-list", false);
            requestReviewInfo("ReviewerId", userId, "reviews-written-list", true);
        }
    });

    function getPageParams() {
        const urlParams = new URLSearchParams(window.location.search);
        RevieweeId = urlParams.get('RevieweeId');
        ReviewerId = urlParams.get('ReviewerId');
    }

    function requestReviewInfo(GetId, Id, ListId, DisplayRevieweeName) {
        var body = {
            [GetId]: Id
        };
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/get-reviews',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify(body),
            contentType: 'application/json',
            success: function (Result) {
                updateReviews(ListId, Result, DisplayRevieweeName);
            },
            error: function error(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        });
    }

    function updateReviews(ListId, Result, DisplayRevieweeName) {
        var reviewsList = $('#' + ListId);
        if (Result['Reviews'].length == 0) {
            noReviewsItem = '<p>There are no reviews for this user yet.</p>';
            reviewsList.append(noReviewsItem);
        }
        else {
            Result['Reviews'].forEach(review => {
                var deleteReview = '';
                var deleteId = review['ReviewId'] + '_delete'
                var changeReview = '';
                var changeId = review['ReviewId'] + '_change'
                if (review['IsMyReview'] == true) {
                    deleteReview = '<a style=\"margin-left:20px;\" id=\"' + deleteId + '\" href=\"#\">Delete Review</a>';
                    changeReview = '<a id=\"' + changeId + '\" href=\"#\">Change Review</a>';
                }

                var revieweeName = '';
                if (DisplayRevieweeName == true) {
                    revieweeName = '<h2>' + review['RevieweeUser']['UserName'] + '</h2>';
                }

                var ReviewerUsername = review['ReviewerUser']['UserName'];
                var ReviewText = review['Review'];
                var StarRating = review['Rating'];

                var reviewerUsernameItem = '<p>' + ReviewerUsername + '</p>';

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
                var reviewRatingItem = highlightedStars + unhighlightedStars;

                var reviewTextItem = '<p>' + ReviewText + '</p>';
                var reviewItem = '<div class=\"review-item\"> <div class=\"review-bubble\">' + revieweeName + reviewRatingItem + reviewTextItem + changeReview + deleteReview + '</div><div>' + reviewerUsernameItem + '</div></div>';
                reviewsList.append(reviewItem);
                if (review['IsMyReview'] == true) {
                    $('#' + deleteId).click(createOnDeleteReviewClick(review['ReviewId']));
                    $('#' + changeId).click(createOnChangeReviewClick(review['ReviewId']));
                }
            });
        }
    }

    function createOnChangeReviewClick(matchReviewId) {
        return function () {
            window.location.href = 'create_review.html?ReviewId=' + matchReviewId;
        };
    }

    function createOnDeleteReviewClick(reviewId) {
        return function () {
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