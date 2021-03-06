/*
 * Copyright (c) 2017, Raphael "rGunti" Guntersweiler
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

var laddaLike;
var laddaSubmit;
var laddaCheck;
var laddaSubmitReport;

function setupLaddaButton(selector) {
    if ($(selector).length > 0) {
        return Ladda.create(document.querySelector(selector));
    } else {
        return null;
    }
}

$(document).ready(function() {
    // Set Alertify position
    alertify.logPosition("top right");

    // Setup Ladda Buttons
    //laddaLike = setupLaddaButton('.btn-post-like');
    laddaSubmit = setupLaddaButton('#uploadURLSubmitButton');
    laddaCheck = setupLaddaButton('#uploadURLTestButton');
    laddaSubmitReport = setupLaddaButton('#reportSubmitButton');

    // jQuery Setup
    $('.btn-post-like').click(function(e) {
        var self = this;
        var jSelf = $(self);
        var laddaSelf = Ladda.create(self);
        laddaSelf.start();

        var postID = jSelf.data('id');
        if (!postID) { return; }

        $.ajax({
            url: '/p/' + postID + '/vote',
            method: 'post'
        }).done(function(data) {
            console.log(data, self, jSelf);
            if (jSelf.hasClass('btn-success')) { jSelf.removeClass('btn-success') }
            else { jSelf.addClass('btn-success') }

            var voteCountLabel = $('.post-vote-count', jSelf);
            voteCountLabel.html(data.voteCount);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseText) {
                try {
                    var errorInfo = JSON.parse(jqXHR.responseText);
                    alertify.error(errorInfo.error);
                } catch (err) {
                    alertify.error('DERP!');
                }
            }
        }).always(function() {
            laddaSelf.stop();
        });
    });

    function extractHostname(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }

    function testImage(url, timeoutT) {
        return new Promise(function (resolve, reject) {
            var timeout = timeoutT || 5000;
            var timer, img = new Image();
            img.onerror = img.onabort = function () {
                clearTimeout(timer);
                reject("error");
            };
            img.onload = function () {
                clearTimeout(timer);
                resolve("success");
            };
            timer = setTimeout(function () {
                // reset .src to invalid URL so it stops previous
                // loading, but doesn't trigger new load
                img.src = "//!!!!/test.jpg";
                reject("timeout");
            }, timeout);
            img.src = url;
        });
    }

    function checkUploadForm(ignoreTitle) {
        $('form .text-danger').hide();
        $('#uploadURL').removeClass('is-invalid');
        $('#uploadPostTitle').removeClass('is-invalid');
        $('#uploadURLImageValid').hide();
        $('#uploadPostTitleTooLong').hide();
        $('#uploadPostCaptchaMissing').hide();

        var url = $('#uploadURL').val();
        var title = $('#uploadPostTitle').val();

        var urlValid = false;
        var titleValid = false;

        if (url) {
            //var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
            //var regex = new RegExp(urlRegex);
            //
            //if (!url.match(regex)) {
            //    $('#uploadURL').addClass('is-invalid');
            //    $('#uploadURLInvalidURL').show();
            //} else {
            //    var hostname = extractHostname(url);
            //    if (ALLOWED_HOSTS.indexOf(hostname) >= 0) {
            //        urlValid = true;
            //    } else {
            //        $('#uploadURLInvalidHost').show();
            //    }
            //}
            urlValid = true;
        } else {
            $('#uploadURL').addClass('is-invalid');
            $('#uploadURLEmpty').show();
        }

        if (!ignoreTitle) {
            if (title) {
                if (title.length > 100) {
                    $('#uploadPostTitleTooLong').show();
                } else {
                    titleValid = true;
                }
            } else {
                $('#uploadPostTitle').addClass('is-invalid');
                $('#uploadPostTitleEmpty').show();
            }
        }

        var captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
            $('#uploadPostCaptchaMissing').show();
        }

        return {
            url: url,
            title: title,
            'g-recaptcha-response': captchaResponse,
            valid: urlValid && (ignoreTitle ? true : titleValid) && (captchaResponse)
        }
    }

    $('#uploadForm').submit(function(e) {
        e.preventDefault();

        var formData = checkUploadForm();
        if (!formData.valid) { return; }

        laddaSubmit.start();

        testImage(formData.url)
            .then(function() {
                $.ajax({
                    url: '/p',
                    method: 'post',
                    data: formData
                }).done(function(data) {
                    window.location.href = '/p/' + data.postID;
                }).fail(function(jqXHR) {
                    if (jqXHR.responseText) {
                        try {
                            var errorInfo = JSON.parse(jqXHR.responseText);
                            if (errorInfo.error instanceof Array) {
                                errorInfo.error.forEach(function(item, i, a) {
                                    alertify.error(item);
                                });
                            } else {
                                alertify.error(errorInfo.error);
                            }
                        } catch (err) {
                            alertify.error('DERP!');
                        }
                    }
                    laddaSubmit.stop();
                }).always(function() {
                    laddaSubmit.stop();
                });
            })
            .catch(function() {
                $('#uploadURLInvalidType').show();
                laddaCheck.stop();
            });
    });

    $('#uploadURLTestButton').click(function(e) {
        e.preventDefault();

        var formData = checkUploadForm(true);
        if (formData.valid) {
            laddaCheck.start();
            testImage(formData.url)
                .then(function() {
                    laddaCheck.stop();
                    $('#uploadURLImageValid').show();
                })
                .catch(function() {
                    $('#uploadURLInvalidType').show();
                    laddaCheck.stop();
                });
        }
    });

    $('#uploadPostTitle').on('input', function(e) {
        var content = $(e.currentTarget).val();
        var len = content.length;
        $('#uploadPostTitleLength').text(Math.max(len, 0));

        $('#uploadPostTitleLengthInfo').removeClass('bg-danger');
        $('#uploadPostTitleLengthInfo').removeClass('bg-warning');
        if (len >= 100) {
            $('#uploadPostTitleLengthInfo').addClass('bg-danger');
        } else if (len > 75) {
            $('#uploadPostTitleLengthInfo').addClass('bg-warning');
        }
    });

    function checkReportForm() {
        $('form .form-control.text-danger').hide();
        $('#reportReason').removeClass('is-invalid');
        $('#reportCommentText').removeClass('is-invalid');
        $('#reportReasonEmpty').hide();
        $('#reportCommentTextEmpty').hide();
        $('#reportCommentTextTooShort').hide();
        $('#reportCommentTextTooLong').hide();
        $('#reportCaptchaMissing').hide();

        var reason = $('#reportReason').val();
        var reasonValid = true;
        if (!reason || reason.toUpperCase() === 'UNDEF') {
            reasonValid = false;
            $('#reportReasonEmpty').show();
            $('#reportReason').addClass('is-invalid');
        }

        var comment = $('#reportCommentText').val();
        var commentValid = true;
        if (!comment) {
            commentValid = false;
            $('#reportCommentText').addClass('is-invalid');
            $('#reportCommentTextEmpty').show();
        } else if (comment.length < 10) {
            commentValid = false;
            $('#reportCommentText').addClass('is-invalid');
            $('#reportCommentTextTooShort').show();
        } else if (comment.length > 500) {
            commentValid = false;
            $('#reportCommentText').addClass('is-invalid');
            $('#reportCommentTextTooLong').show();
        }

        var captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
            $('#reportCaptchaMissing').show();
        }

        return {
            reason: reason,
            comment: comment,
            'g-recaptcha-response': captchaResponse,
            postID: $('#reportPostID').val(),
            valid: (reasonValid && commentValid && captchaResponse)
        };
    }

    $('#reportForm').submit(function(e) {
        e.preventDefault();

        var formData = checkReportForm();
        if (!formData.valid) { return; }

        laddaSubmitReport.start();

        $.ajax({
            url: '/p/' + formData.postID + '/report',
            method: 'post',
            data: formData
        }).done(function(data) {
            if (data.ok) {
                $('form').html('');
                alertify.success(data.message);
                setTimeout(function() {
                    window.location.href = '/?p=' + formData.postID;
                }, 5000)
            }
        }).fail(function(jqXHR) {
            try {
                var errorInfo = JSON.parse(jqXHR.responseText);
                if (errorInfo.error instanceof Array) {
                    errorInfo.error.forEach(function(item, i, a) {
                        alertify.error(item);
                    });
                } else {
                    alertify.error(errorInfo.error);
                }
            } catch (err) {
                alertify.error('DERP!');
            }
        }).always(function() {
            laddaSubmitReport.stop();
        });
    });

    $('#reportCommentText').on('input', function(e) {
        var content = $(e.currentTarget).val();
        var len = content.length;

        $('#reportCommentTextLength').text(Math.max(len, 0));

        $('#reportCommentTextLengthInfo').removeClass('text-danger');
        $('#reportCommentTextLengthInfo').removeClass('text-warning');
        $('#reportCommentTextLengthInfo').removeClass('text-muted');
        if (len < 10 || len >= 500) {
            $('#reportCommentTextLengthInfo').addClass('text-danger');
        } else if (len > 450) {
            $('#reportCommentTextLengthInfo').addClass('text-warning');
        } else {
            $('#reportCommentTextLengthInfo').addClass('text-muted');
        }
    });

    $('.hidden-on-startup').hide();
    $('.hidden-on-startup').removeClass('hidden-on-startup');
});
