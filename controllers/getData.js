var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var data = require('../constants/data').data;
var FacilitySchema = require('../models/clubFacilities').Facility;

function getData() {
    let clubFacilitiesModel;
    let clubRulesModel;

    async.series([
        function (sCb) {
            async.each(data.facilities, function (item, eCb) {
                clubFacilitiesModel = new mongoose.models.Facility(item);
                clubFacilitiesModel.save().then(function () {
                    eCb();
                });
            }, function (err, res) {
                if (err) {
                    return sCb(err);
                }

                sCb();
            });
    },
        function (sCb) {
            async.each(data.rules, function (item, eCb) {
                clubRulesModel = new mongoose.models.Rule(item);
                clubRulesModel.save().then(function () {
                    eCb();
                });
            }, function (err, res) {
                if (err) {
                    return sCb(err);
                }

                sCb();
            });
        }
    ], function (err) {
       let aggregationQuery;

       if (err) {
          return console.error(err);
       }

       aggregationQuery = [
           {
               $unwind: {
                   path: '$club_facilities'
               }
           }, {
               $match: {
                   'club_facilities.club_facility_id': {
                       $in: ['442b0260-c378-11e6-849f-2d3cce21cca1', '4b77ab50-c0bb-11e6-a8cf-65fef1c91a7c']
                   }
               }
           }, {
               $lookup: {
                   from: 'rules',
                   localField: 'null',
                   foreignField: 'null',
                   as: 'rules'
               }
           }, {
               $unwind: {
                   path: '$rules'
               }
           }, {
               $unwind: {
                   path: '$rules.rules'
               }
           }, {
               $project: {
                   club_facility_id: '$club_facilities.club_facility_id',
                   club_facility_name_en: '$club_facilities.club_facility_name_en',
                   club_facility_name_it: '$club_facilities.club_facility_name_it',
                   club_facility_rule_id: '$club_facilities.club_facility_rule_id',
                   rule_id: '$rules.rules.rule_id',
                   rule_name: '$rules.rules.rule_name',
                   rule_description: '$rules.rules.rule_description',
                   approval: '$rules.rules.approval',
                   medical_certificate: '$rules.rules.medical_certificate',
                   updated_at: '$rules.rules.updated_at',
                   result: {$eq: ['$club_facilities.club_facility_rule_id', '$rules.rules.rule_id']}
               }
           }, {
               $match: {
                   result: true
               }
           }, {
               $group: {
                   _id: '$club_facility_id',
                   club_facility_name_en: {$first: '$club_facility_name_en'},
                   club_facility_name_it: {$first: '$club_facility_name_it'},
                   club_facility_rule_id: {$first: '$club_facility_rule_id'},
                   rule: {$push: {
                       rule_id: '$rule_id',
                       rule_name: '$rule_name',
                       rule_description: '$rule_description',
                       approval: '$approval',
                       medical_certificate: '$medical_certificate',
                       updated_at: '$updated_at',
                   }}
               }
           }
       ];

       console.log('all data saved successfully');

       console.log('we are getting data by "club_facility_id" ["442b0260-c378-11e6-849f-2d3cce21cca1', '4b77ab50-c0bb-11e6-a8cf-65fef1c91a7c"]');

       FacilitySchema.aggregate(aggregationQuery).then(function (result) {
           console.log(result)
       });
    });
}

module.exports = {
    getData: getData
};