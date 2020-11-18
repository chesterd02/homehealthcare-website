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
        initHandlers();
        setText();
        requestReviewInfo();
        requestUserInfo();
    });

    function getPageParams() {
        ReviewId = localStorage.getItem("ReviewId");
        RevieweeId = localStorage.getItem("RevieweeId");
        // RevieweeId = "3333";
        // ReviewId = "RA3A3";
    }

    function initHandlers() {
        $(':radio').change(function() {
            StarRating = this.value;
        });

        $('#review_text').on('change keyup paste', function() {
            ReviewText = $(this).val();
        });

        $('#save-button').on('click', function() {
            if (ReviewId != null) {
                saveReview();
            } else {
                createReview();
            }
        });
    }

    function createReview() {
        var body = {
            RevieweeId: RevieweeId,
            Review: ReviewText,
            Rating: StarRating
        };
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/create-review',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify(body),
            contentType: 'application/json',
            success: function() {
                alert('Review Saved!')
            },
            error: function error(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        })
    }

    function saveReview() {
        if (ReviewId != null) {
            var body = {
                ReviewId: ReviewId,
                Review: ReviewText,
                Rating: StarRating
            };
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/update-review',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify(body),
                contentType: 'application/json',
                success: function() {
                    alert('Review Saved!')
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                }
            })
        }
    }

    function setText() {
        var title = $('#review-title');
        var saveButton = $('#save-button');
        if (ReviewId != null) {
            title.append("Change Review");
            saveButton.prop('value', 'Save Review');
        } else {
            title.append("Add Review");
            saveButton.prop('value', 'Add Review');
        }
    }

    function requestUserInfo() {
        alert("This needs to call chester's lambda to get a username from their ID");
        var body = {
            UserId: RevieweeId
        };
        // $.ajax({
        //     method: 'POST',
        //     url: _config.api.invokeUrl + '/get-info',
        //     headers: {
        //         Authorization: authToken,
        //     },
        //     data: JSON.stringify(body),
        //     contentType: 'application/json',
        //     success: function(result) {
        //         $('#review-username').append(username);
        //     },
        //     error: function error(jqXHR, textStatus, errorThrown) {
        //         console.error(errorThrown);
        //     }
        // });
    }

    function requestReviewInfo() {
        if (ReviewId != null) {
            var body = {
                ReviewId: ReviewId
            };
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/get-reviews',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify(body),
                contentType: 'application/json',
                success: updateReviewUI,
                error: function error(jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                }
            });
        }
    }

    function updateReviewUI(result) {
        if (result['Reviews'].length > 0) {
            var review = result['Reviews'][0];
            ReviewText = review['Review'];
            StarRating = review['Rating'];

            var reviewTextArea = $('#review_text');
            reviewTextArea.val(ReviewText);

            var starRatingWidget = $('#stars' + StarRating)
            starRatingWidget.prop('checked', true);
        }
    }

}(jQuery));