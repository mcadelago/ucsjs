var xml2js = require('xml2js'),
    http = require('http'),
    Q = require('q');

var builder = new xml2js.Builder();
var parser = new xml2js.Parser();


var Client = function () {
    this.loginResponse = Object;

    this.reqOptions = {
        host: String,
        port: 80,
        path: '/nuova',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Number
        }
    };
};


//send xml to UCS domain and parse results back into JSON
Client.prototype._exec = function (json) {
    var deferred = Q.defer();
    var xml = builder.buildObject(json);

    this.reqOptions.headers['Content-Length'] = xml.length;

    http.request(this.reqOptions, function (res) {
        var responseXML = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            responseXML += chunk;
        });

        res.on('end', function () {
            parser.parseString(responseXML, function (err, output) {
                if (err) deferred.reject(err);
                else {
                    if (output.error) deferred.reject(output.error.$);
                    else {
                        var header = Object.keys(output)[0];
                        deferred.resolve(output[header]);
                    }
                }
            });
        });
    })

        .on('error', deferred.reject)
        .write(xml);

//    .end();

    return deferred.promise;
};


Client.prototype.resolveClass = function (ucsClass) {
    var deferred = Q.defer();

    this._exec({
        'configResolveClass': {
            '$': {
                'cookie': this.loginResponse.outCookie,
                'inHierarchical': 'false',
                'classId': ucsClass
            }
        }
    })
        .then(function (response) {
            var list = response.outConfigs[0][ucsClass];
            var output = [];
            for (var i=0; i < list.length; i++) {
                output.push(list[i].$);
            }
            deferred.resolve(output);
        })
        .fail(deferred.reject);

    return deferred.promise;
};


Client.prototype.resolveDN = function (dn) {
    var deferred = Q.defer();

    this._exec({
        'configResolveDn': {
            '$': {
                'cookie': this.loginResponse.outCookie,
                'inHierarchical': 'false',
                'dn': dn
            }
        }
    })

        .then(function (response) {
            try {
                if (response.outConfig && response.outConfig[0] != ' ') {
                    var key = Object.keys(response.outConfig[0])[0];
                    deferred.resolve(response.outConfig[0][key][0].$);
                }
                else deferred.reject(new Error('unable to resolve DN: ' + dn));
            }
            catch (e) {
                deferred.reject(e);
            }
        })

        .fail(deferred.reject);

    return deferred.promise;
};


Client.prototype.logout = function () {
    return this._exec({
        'aaaLogout': {
            '$': {
                'inCookie': this.loginResponse.outCookie
            }
        }
    });
};


//options should look as follows: {'domain': <UCS domain name>, 'user': <username>, 'password': <password>}
exports.login = function (options) {
    var deferred = Q.defer();

    var client = new Client;
    client.reqOptions.host = options.domain;

    var login = {
        'aaaLogin': {
            '$': {
                'inName': options.user,
                'inPassword': options.password
            }
        }
    };

    client._exec(login)
        .then(function (response) {
            client.loginResponse = response.$;
            if (client.loginResponse.outCookie) deferred.resolve(client);
            else deferred.reject(client.loginResponse);
        })
        .fail(deferred.reject);

    return deferred.promise;
};