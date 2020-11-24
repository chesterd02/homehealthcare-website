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
        const urlParams = new URLSearchParams(window.location.search);
        ReviewId = urlParams.get('ReviewId');
        RevieweeId = urlParams.get('RevieweeId');
    }

    function initHandlers() {
        $(':radio').change(function () {
            StarRating = this.value;
        });

        $('#review_text').on('change keyup paste', function () {
            ReviewText = $(this).val();
        });

        $('#save-button').on('click', function () {
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
            success: function () {
                alert('Review Added!')
                window.history.back();
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
                success: function () {
                    alert('Review Saved!')
                    window.history.back();
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
        if (RevieweeId != null) {
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/getclickedinfo',
                headers: {
                    Authorization: authToken
                },
                data: JSON.stringify({
                    ClickedId: RevieweeId,
                }),
                contentType: 'application/json',
                success: function (result) {
                    var username = result.Items[0].UserName;
                    $('#review-username').append('Review for: ' + username);
                    $('.spinner').hide();
                    $('.content').show();
                },
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occurred while retrieving that persons info.' + JSON.stringify(jqXHR));
                    // alert('An error occurred when requesting your user Info:\n' + JSON.stringify(jqXHR));
                }
            });
        }
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
            RevieweeId = review['RevieweeId'];
            requestUserInfo();
        }
    }

}(jQuery));