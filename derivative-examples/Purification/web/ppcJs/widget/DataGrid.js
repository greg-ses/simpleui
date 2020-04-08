// ~/widget/DataGrid
// DataGrid that doesn't clear data on refresh (no redraws). Use with SyndicatingXmlStore.

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojox/grid/EnhancedGrid'],
function (declare, lang, array, EnhancedGrid) {
    return declare([EnhancedGrid],
    {
        setQuery: function (query, queryOptions) {
            if (this._requestsPending(0)) {
                return;
            }
            this._setQuery(query, queryOptions);
            this._refresh(true, true);
        },

        _fetch: function (start, isRender, noFetch) {
            start = start || 0;
            if(this.store && !this._pending_requests[start]){
                if(!this._isLoaded && !this._isLoading){
                    this._isLoading = true;
                    this.showMessage(this.loadingMessage);
                }
                this._pending_requests[start] = true;

                try{
                    if(this.items){
                        var items = this.items;
                        var store = this.store;
                        this.rowsPerPage = items.length;
                        var req = {
                            start: start,
                            count: this.rowsPerPage,
                            isRender: isRender,
                            noFetch: noFetch
                        };
                        this._onFetchBegin(items.length, req);
					
                        // Load them if we need to
                        var waitCount = 0;
                        array.forEach(items, function(i){
                            if(!store.isItemLoaded(i)){ waitCount++; }
                        });
                        if(waitCount === 0){
                            this._onFetchComplete(items, req);
                        }else{
                            var onItem = function(item){
                                waitCount--;
                                if(waitCount === 0){
                                    this._onFetchComplete(items, req);
                                }
                            };
                            array.forEach(items, function(i){
                                if(!store.isItemLoaded(i)){
                                    store.loadItem({item: i, onItem: onItem, scope: this});
                                }
                            }, this);
                        }
                    }else{
                        this.store.fetch({
                            start: start,
                            count: this.rowsPerPage,
                            query: this.query,
                            sort: this.getSortProps(),
                            queryOptions: this.queryOptions,
                            isRender: isRender,
                            noFetch: noFetch,
                            onBegin: lang.hitch(this, "_onFetchBegin"),
                            onComplete: lang.hitch(this, "_onFetchComplete"),
                            onError: lang.hitch(this, "_onFetchError")
                        });
                    }
                }catch(e){
                    this._onFetchError(e, {start: start, count: this.rowsPerPage});
                }
            }
        },
        
        // override
        _refresh: function (isRender, noFetch) {
            //this._clearData();
            this._fetch(0, isRender, noFetch);
        },

        // override
        _onFetchComplete: function (items, req) {
            if (this.scroller) {
                if (items && items.length > 0) {
                    array.forEach(items, function (item, idx) {
                        this._addItem(item, req.start + idx, true);
                    }, this);

                    this.updateRows(req.start, items.length);

                    if (req.isRender) {
                        this.setScrollTop(0);
                        this.postrender();
                    } 
                    else if (this._lastScrollTop) {
                        this.setScrollTop(this._lastScrollTop);
                    }
                }

                delete this._lastScrollTop;

                if (!this._isLoaded) {
                    this._isLoading = false;
                    this._isLoaded = true;
                }

                this._pending_requests[req.start] = false;
            }
        }
    });
});