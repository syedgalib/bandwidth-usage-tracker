const helpers = {
    setupMySQLDateFormat: function() {
        const self = this;
        
        Date.prototype.toMySQLFormat = function() {
            return this.getUTCFullYear() 
              + "-" + self.toTwoDigits(1 + this.getUTCMonth()) 
              + "-" + self.toTwoDigits(this.getUTCDate()) 
              + " " + self.toTwoDigits(this.getUTCHours()) + ":" + self.toTwoDigits(this.getUTCMinutes()) + ":" + self.toTwoDigits(this.getUTCSeconds());
        };
    },

    toTwoDigits: function(d) {
        if ( 0 <= d && d < 10 ) {
            return "0" + d.toString();
        }
    
        if ( -10 < d && d < 0 ) {
            return "-0" + ( -1 * d ).toString();
        }
    
        return d.toString();
    }
};

const bandwidthMonitor = function( axios, userConfig ) {
    return new Promise((resolve, reject) => {
        let total_sent_bytes     = 0;
        let total_received_bytes = 0;
        
        let config = ( userConfig && typeof userConfig === 'object' ) ? userConfig : {};

        if ( Array.isArray( config ) ) {
            config = {};
        }

        if ( ! Object.keys( config ).includes( 'method' ) ) {
            config.method = 'get'
        }

        if ( ! Object.keys( config ).includes( 'headers' ) ) {
            config.headers = {};
        }

        if ( ! ( config.headers && typeof config.headers === 'object' ) ) {
            config.headers = {};
        }

        if ( 'post' === config.method ) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        // onUploadProgress
        // ------------------------------
        const onUploadProgress = function ( progressEvent ) {
            total_sent_bytes = progressEvent.loaded;
        };

        if ( Object.keys( config ).includes( 'onUploadProgress' ) ) {
            let userOnUploadProgress = config.onUploadProgress;

            config.onUploadProgress = function( progressEvent ) {
                onUploadProgress( progressEvent );

                try {
                    userOnUploadProgress( progressEvent );
                } catch ( error ) {
                    console.log( error );
                }
                
            };
        } else {
            config.onUploadProgress = onUploadProgress;
        }

        // onDownloadProgress
        // ------------------------------
        const onDownloadProgress = function (progressEvent) {
            total_received_bytes = progressEvent.loaded;
        };
        
        if ( Object.keys( config ).includes( 'onDownloadProgress' ) ) {
            let userOnDownloadProgress = config.onDownloadProgress;

            config.onDownloadProgress = function( progressEvent ) {
                onDownloadProgress( progressEvent );

                try {
                    userOnDownloadProgress( progressEvent );
                } catch ( error ) {
                    console.log( error );
                }
                
            };
        } else {
            config.onDownloadProgress = onDownloadProgress;
        }

        try {
            axios( config )
            .then(function (response) {
                resolve( response );
            })
            .catch(function (error) {
                reject( error );
            })
            .finally( function() {
                if ( Object.keys( config ).includes( 'bandwidthMonitorOnFinish' ) && typeof config.bandwidthMonitorOnFinish === 'function' ) {
                    
                    helpers.setupMySQLDateFormat();
                    let date = new Date();
                    
                    config.bandwidthMonitorOnFinish({ 
                        total_sent_bytes, 
                        total_received_bytes, 
                        totalBandwidth: (total_sent_bytes + total_received_bytes),
                        dateTime: date.toMySQLFormat(),
                        timestamp: Date.now(),
                    });
                }
            });
        } catch ( error ) {
            reject( error );
        }
        
    });
};



export default bandwidthMonitor;