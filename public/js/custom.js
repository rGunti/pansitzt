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
$(document).ready(function() {
    // Set Alertify position
    alertify.logPosition("top right");

    laddaLike = Ladda.create(document.querySelector('.btn-post-like'));

    $('.btn-post-like').click(function() {
        var self = this;
        var jSelf = $(self);
        laddaLike.start();

        var postID = jSelf.data('id');
        if (!postID) { return; }

        $.ajax({
            url: '/p/' + postID + '/vote',
            method: 'post'
        }).done(function() {
            if (jSelf.hasClass('btn-success')) { jSelf.removeClass('btn-success') }
            else { jSelf.addClass('btn-success') }
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
            laddaLike.stop();
        });
    });
});
