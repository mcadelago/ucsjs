require('mocha-as-promised')();

var should = require('should'),
    ucs = require('../client'),
    clientConfig = require('./testDomain');


describe('UCS Client', function () {
    this.timeout(5000);

    describe('login', function () {

        it('should log into the thing', function () {

            return ucs.login(clientConfig)
                .then(function (client) {
                    client.loginResponse.should.have.property('outCookie');
                    return client.logout();
                });

        });

        it('should fail nicely if it cannnot log in', function () {

            var config = {
                'domain': 'ucs-ar120-r5',
                'user': 'admin',
                'password': 'blahblooooo'
            };

            return ucs.login(config)
                .fail(function (err) {
                    err.errorDescr.should.match(/Authentication failed/);
                });
        });
    });

    describe('resolveClass', function () {

        it('should retrieve a list of blades', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveClass('computeBlade');
                })

                .then(function (response) {
                    response.computeBlade[0].should.have.property('dn');
                })

                .fin(function () {
                    return Client.logout();
                })
        });


        it('should retrieve a list of service profiles', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveClass('lsServer');
                })

                .then(function (response) {
                    response.lsServer[0].should.have.property('dn');
                })

                .fin(function () {
                    return Client.logout();
                });
        });

        it('should fail nicely if specified class is invalid', function () {

            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveClass('fartybutt');
                })

                .fail(function (err) {
                    err.errorDescr.should.match(/no class named fartybutt/);
                })

                .fin(function () {
                    return Client.logout();
                });

        });

    });

    describe('resolveChildren', function () {
        it('should retrieve the child items based on a DN', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveChildren('sys/chassis-1/blade-2');
                })

                .then(function (response) {
                    response.should.have.property('firmwareStatus');
                })

                .fin(function () {
                    return Client.logout();
                });

        });


        it('should fail on an invalid DN', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveChildren('sys/csis-1/blade-2');
                })

                .fail(function (err) {
                    err.message.should.match(/unable to resolve/);
                })

                .fin(function () {
                    return Client.logout();
                });

        });


    });

    describe('resolveParent', function () {
        it('should retrieve the child items based on a DN', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveParent('sys/chassis-1/blade-2');
                })

                .then(function (response) {
                    response.equipmentChassis[0].should.have.property('power');
                })

                .fin(function () {
                    return Client.logout();
                });
        });
    });

    describe('resolveDN', function () {

        it('should retrieve a service profile based on DN', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveDN('org-root/org-FC_B2B_Test/ls-crackle')
                })

                .then(function (response) {
                    response.lsServer[0].should.have.property('assignState');
                })

                .fin(function () {
                    return Client.logout();
                });
        });

        it('should retrieve a blade based on DN', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveDN('sys/chassis-1/blade-2')
                })

                .then(function (response) {
                    response.computeBlade[0].should.have.property('assignedToDn');
                })

                .fin(function () {
                    return Client.logout();
                });
        });

        it('should fail to retrieve an invalid DN', function () {
            var Client;
            return ucs.login(clientConfig)
                .then(function (c) {
                    Client = c;
                    return Client.resolveDN('s-1/blade-2')
                })

                .fail(function (err) {
                    err.message.should.match(/unable to resolve/);
                })

                .fin(function () {
                    return Client.logout();
                });
        });

    });

});

