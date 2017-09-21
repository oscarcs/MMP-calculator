"use strict";
window.calculateMMP = function(parties, electorates) {

    function getValidParties(parties, electorates) {
        let total = parties.reduce((acc, x) => acc += x.votes, 0);

        let numQuotas = 120;
        let validParties = [];
        
        for (let i in parties) {
            let electorateSeats = electorates.find(x => x.name === parties[i].name);
    
            if (parties[i].votes >= total * 0.05 ||
                (typeof electorateSeats !== 'undefined' && electorateSeats.seats > 0)
            ) {
                validParties.push(parties[i]);
            }
        }

        for (let i in electorates) {
            let party = parties.find(x => x.name === electorates[i].name);
            if (typeof party === 'undefined') {
                numQuotas -= electorates[i].seats;
            }
        }
        return calculateQuotas(numQuotas, validParties, electorates);
    }
    
    function calculateQuotas(numQuotas, parties, electorates) {
        let quotas = [];

        for (let i = 0; i < numQuotas; i++) {
            for (let j in parties) {
                quotas.push({
                    party: parties[j].name,
                    allocation: parties[j].votes / ((i * 2) + 1)
                });
            }
        }

        // Sort the quotas and take the number required.
        quotas.sort((x, y) => y.allocation - x.allocation);
        quotas = quotas.slice(0, numQuotas);
    
        // Set up the 'quota' property on each of the parties.
        for (let i in parties) {
            parties[i].quota = 0;
        }
        
        // Allocate the quotas:
        for (let i in quotas) {
            let party = parties.find(x => x.name === quotas[i].party);
            party.quota += 1;
        }
        
        for (let i in electorates) {
            let electorateParty = electorates[i];

            let party = parties.find(x => x.name === electorateParty.name);
            
            // Provide for possible overhangs.
            if (typeof party !== "undefined") {
                party.quota = Math.max(party.quota, electorateParty.seats);
            }
            // Add independents and other parties not contesting the party vote
            else {
                parties.push({
                    name: electorateParty.name,
                    votes: 0,
                    quota: electorateParty.seats
                })
            }
        }

        // Calculate the total number of seats:
        let totalSeats = parties.reduce((acc, x) => acc += x.quota, 0);

        let parliament = {
            seats: totalSeats,
            parties: parties,
        };
        
        return parliament;
    }

    return getValidParties(parties, electorates);
}