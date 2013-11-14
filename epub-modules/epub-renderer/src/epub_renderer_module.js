define(['require', 'module', 'jquery', 'underscore', 'backbone', 'readerView', 'URIjs'],

    function (require, module, $, _, Backbone, ReadiumSDK, URI) {

        var ReadiumSDK = window.ReadiumSDK;

        var origLoadIframeFunction = ReadiumSDK.Helpers.LoadIframe;

        var loadIframeFunctionGenerator = function(epubFetch, reader) {
            return  function(iframe, src, origCallback, context) {
                var callback = function(success) {
                    var epubContentDocument = this.$iframe[0].contentDocument;
                    $('a', epubContentDocument).click(function (clickEvent) {
                        // Check for both href and xlink:href attribute and get value
                        var href;
                        if (clickEvent.currentTarget.attributes["xlink:href"]) {
                            href = clickEvent.currentTarget.attributes["xlink:href"].value;
                        }
                        else {
                            href = clickEvent.currentTarget.attributes["href"].value;
                        }
                        var hrefUri = new URI(href);
                        var hrefIsRelative = hrefUri.is('relative');
                        var hrefUriHasFilename = hrefUri.filename();
                        var overrideClickEvent = false;

                        if (hrefIsRelative) {
                            // TODO:
                            if (hrefUriHasFilename /* TODO: && check whether href actually resolves to a spine item */) {

                                var currentSpineItemUri = new URI(context.currentSpineItem.href);
                                var openedSpineItemUri = hrefUri.absoluteTo(currentSpineItemUri);
                                var idref = openedSpineItemUri.pathname();
                                var hashFrag = openedSpineItemUri.fragment();
                                var spineItem = context.spine.getItemByHref(idref);
                                var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem);
                                if (hashFrag) {
                                    pageData.setElementId(hashFrag);
                                }
                                reader.openPage(pageData);
                                overrideClickEvent = true;
                            } // otherwise it's probably just a hash frag that needs to be handled by browser's default handling
                        } else {
                            // It's an absolute URL to a remote site - open it in a separate window outside the reader
                            window.open(href, '_blank');
                            overrideClickEvent = true;
                        }

                        if (overrideClickEvent) {
                            clickEvent.preventDefault();
                            clickEvent.stopPropagation();
                        }
                    });
                    
                    //ASL Trigger Code
                    $(document).ready(function() {
                        $('body').append('<div id="lightbox" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);text-align:center;z-index:9999"></div>');

                        $("body").dblclick(function() {
                            // Gets clicked on word (or selected text if text is selected)
                            var t = '';
                            var s = window.getSelection();
                            if (s) {
                                if (s.isCollapsed) { //nothing is selected. Only clicked.
                                    s.modify('move', 'forward', 'character');
                                    s.modify('move', 'backward', 'word');
                                    s.modify('extend', 'forward', 'word');
                                   
                                    t = s.toString();
                                    t = t.replace(/'s/g,"");
                                    t = t.replace(/'d/g,"");
                                    t = t.replace(/~/g," ");
                                    t = t.replace(/_/g," ");
                                    t = t.replace(".", "");
                                    t = t.replace(",","");
                                    
                                    s.modify('move', 'forward', 'character'); //clear selection
                                }
                            }

                            //xmlhttprequest call to database, input = t, fails in function, and won't return data
                            //however, data is visible, and succeeded in the GET command when viewed
                            //from within browser's network tab of console

                            if ( t !== "" ) {
                                var idArray;

                                GM_xmlhttpRequest({
                                    method: "GET",
                                    url: "http://smartsign.imtc.gatech.edu/videos?keywords=" + t,
                                    onload: function(response) {
                                        var data = $.parseJSON(response.responseText);

                                        idArray= new Array(data.length);

                                        for ( var i = 0; i < data.length; i++ ) {
                                            idArray[i] = '<iframe width="420" height="345" align:right src="http://www.youtube.com/embed/' + data[i]['id'] + '?rel=0"> </iframe>';
                                        }
                                        
                                        var htmlString = '<div style="width:100%;position=absolute;text-align:right"> <div style="position:relative;left:72%;width:420px;text-align:left;">';

                                        for(var j=0; j<idArray.length; j++) {
                                            htmlString += idArray[j];
                                        }

                                        $('#lightbox')
                                            .html(htmlString + '</div></div>')
                                            .css({"line-height":($(window).height()*0)+"px", "overflow":"auto", "display":"block"})
                                            .fadeIn('fast')
                                            .live('click', function() {
                                                $(this).fadeOut('fast');
                                        });
                                    }
                                });
                            }
                        });

                        $("body").click(function() {
                            // Gets clicked on word (or selected text if text is selected)
                            var t = '';
                            var s = window.getSelection();
                            if (s) {
                                if (s.isCollapsed) {//nothing is selected. Only clicked.
                                } else {
                                    t = s.toString();

                                    t = t.trim();
                                    t = t.replace(/'s/g,"");
                                    t = t.replace(/'d/g,"");
                                    t = t.replace(/~/g," ");
                                    t = t.replace(/_/g," ");
                                    t = t.replace(".", "");
                                    t = t.replace(",","");
                                }
                            }

                            //xmlhttprequest call to database, input = t, fails in function, and won't return data
                            //however, data is visible, and succeeded in the GET command when viewed
                            //from within browser's network tab of console

                            if ( t !== "" ) {
                                var idArray;

                                GM_xmlhttpRequest({
                                    method: "GET",
                                    url: "http://smartsign.imtc.gatech.edu/videos?keywords=" + t,
                                    onload: function(response) {
                                        var data = $.parseJSON(response.responseText);

                                        idArray= new Array(data.length);

                                        for ( var i = 0; i < data.length; i++ ) {
                                            idArray[i] = '<iframe width="420" height="345" align:right src="http://www.youtube.com/embed/' + data[i]['id'] + '?rel=0"> </iframe>';
                                        }
                                        
                                        var htmlString = '<div style="width:100%;position=absolute;text-align:right"> <div style="position:relative;left:72%;width:420px;text-align:left;">';

                                        for(var j=0; j<idArray.length; j++) {
                                            htmlString += idArray[j];
                                        }

                                        $('#lightbox')
                                            .html(htmlString + '</div></div>')
                                            .css({"line-height":($(window).height()*0)+"px", "overflow":"auto", "display":"block"})
                                            .fadeIn('fast')
                                            .live('click', function() {
                                                $(this).fadeOut('fast');
                                        });
                                    }
                                });
                            }
                        });
                    });

                    origCallback.call(this, success);
                }
                if (epubFetch.isPackageExploded()) {
                    return origLoadIframeFunction(iframe, src, callback, context);
                } else {
                    var onLoadWrapperFunction = function(success) {
                        var context = this;
                        var itemHref = context.currentSpineItem.href;
                        epubFetch.relativeToPackageFetchFileContents(itemHref, 'text', function(contentDocumentText) {
                            var srcMediaType = context.currentSpineItem.media_type;

                            epubFetch.resolveInternalPackageResources(itemHref, srcMediaType, contentDocumentText,
                                function (resolvedContentDocumentDom) {
                                    var contentDocument = iframe.contentDocument;
                                    contentDocument.replaceChild(resolvedContentDocumentDom.documentElement,
                                        contentDocument.documentElement);
                                    callback.call(context, success);
                                });
                        }, function(err) {
                            if (err.message) {
                                console.error(err.message);
                            };
                            console.error(err);
                            callback.call(context, success);
                        });
                    };
                    // Feed an artificial empty HTML document to the IFRAME, then let the wrapper onload function
                    // take care of actual document loading (from zipped EPUB) and calling callbacks:
                    var emptyDocumentDataUri = window.URL.createObjectURL(
                        new Blob(['<html><body></body></html>'], {'type': 'text/html'})
                    );
                    return origLoadIframeFunction(iframe, emptyDocumentDataUri, onLoadWrapperFunction, context);
                }
            };
        };

        var EpubRendererModule = function (epubFetch, elementToBindReaderTo, packageData) {

            var reader = new ReadiumSDK.Views.ReaderView({
                el: elementToBindReaderTo
            });

            /*
             * Patch the ReadiumSDK.Helpers.LoadIframe global function to support zipped EPUB packages:
             */
            ReadiumSDK.Helpers.LoadIframe = loadIframeFunctionGenerator(epubFetch, reader);

            // Description: The public interface
            return {

                openBook : function () {
                    return reader.openBook(packageData);
                },
                openSpineItemElementCfi : function (idref, elementCfi) {
                    return reader.openSpineItemElementCfi(idref, elementCfi);
                },
                openSpineItemPage: function(idref, pageIndex) {
                    return reader.openSpineItemPage(idref, pageIndex);
                },
                openPageIndex: function(pageIndex) {
                    return reader.openPageIndex(pageIndex);
                },
                openPageRight : function () {
                    return reader.openPageRight();
                },
                openPageLeft : function () {
                    return reader.openPageLeft();
                },
                updateSettings : function (settingsData) {
                    return reader.updateSettings(settingsData);
                },
                bookmarkCurrentPage : function () {
                    return reader.bookmarkCurrentPage();
                }
            };
        };

        return EpubRendererModule;

    });

