define(['app', 'underscore'], function(app, _) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', function($scope, $http, $route, $location, $filter, $q) {

        $scope.decisions = decisions;

        $scope.$root.page = { title: 'COP-8 Decisions' };
    }];
});

decisions = [{
        number: 1,
        symbol: "Decision VIII/1",
        title: "Island biodiversity"
    }, {
        number: 2,
        symbol: "Decision VIII/2",
        title: "Biological diversity of dry and sub-humid lands"
    }, {
        number: 3,
        symbol: "Decision VIII/3",
        title: "Global Taxonomy Initiative: in-depth review of the implementation of the programme of work for the Global Taxonomy Initiative"
    }, {
        number: 4,
        symbol: "Decision VIII/4",
        title: "Access and benefit-sharing"
    }, {
        number: 5,
        symbol: "Decision VIII/5",
        title: "Article 8(j) and related provisions"
    }, {
        number: 6,
        symbol: "Decision VIII/6",
        title: "Global Initiative on Communication, Education and Public Awareness: overview of implementation of the programme of work and options to advance future work"
    }, {
        number: 7,
        symbol: "Decision VIII/7",
        title: "Global Biodiversity Outlook"
    }, {
        number: 8,
        symbol: "Decision VIII/8",
        title: "Implementation of the Convention and its Strategic Plan"
    }, {
        number: 9,
        symbol: "Decision VIII/9",
        title: "Implications of the findings of the Millennium Ecosystem Assessment"
    }, {
        number: 10,
        symbol: "Decision VIII/10",
        title: "Operations of the Convention"
    }, {
        number: 11,
        symbol: "Decision VIII/11",
        title: "Scientific and technical cooperation and the clearing-house mechanism"
    }, {
        number: 12,
        symbol: "Decision VIII/12",
        title: "Technology transfer and cooperation (Articles 16 to 19)"
    }, {
        number: 13,
        symbol: "Decision VIII/13",
        title: "Review of implementation of Article 20 (Financial resources) and Article 21 (Financial mechanism)"
    }, {
        number: 14,
        symbol: "Decision VIII/14",
        title: "National reporting and the next Global Biodiversity Outlook"
    }, {
        number: 15,
        symbol: "Decision VIII/15",
        title: "Framework for monitoring implementation of the achievement of the 2010 target and integration of targets into the thematic programmes of work"
    }, {
        number: 16,
        symbol: "Decision VIII/16",
        title: "Cooperation with other conventions and international organizations and initiatives"
    }, {
        number: 17,
        symbol: "Decision VIII/17",
        title: "Private‑sector engagement"
    }, {
        number: 18,
        symbol: "Decision VIII/18",
        title: "Guidance to the financial mechanism"
    }, {
        number: 19,
        symbol: "Decision VIII/19",
        title: "Forest biological diversity: implementation of the programme of work"
    }, {
        number: 20,
        symbol: "Decision VIII/20",
        title: "Biological diversity of inland water ecosystems: reporting processes, improving the review of implementation and addressing threats"
    }, {
        number: 21,
        symbol: "Decision VIII/21",
        title: "Marine and coastal biological diversity: conservation and sustainable use of deep seabed genetic resources beyond the limits of national jurisdiction"
    }, {
        number: 22,
        symbol: "Decision VIII/22",
        title: "Marine and coastal biological diversity: enhancing the implementation of integrated marine and coastal area management"
    }, {
        number: 23,
        symbol: "Decision VIII/23",
        title: "Agricultural biodiversity"
    }, {
        number: 24,
        symbol: "Decision VIII/24",
        title: "Protected areas"
    }, {
        number: 25,
        symbol: "Decision VIII/25",
        title: "Incentive measures: application of tools for valuation of biodiversity and biodiversity resources and functions"
    }, {
        number: 26,
        symbol: "Decision VIII/26",
        title: "Incentive measures: preparation for the in-depth review of the programme of work on incentive measures"
    }, {
        number: 27,
        symbol: "Decision VIII/27",
        title: "Alien species that threaten ecosystems, habitats or species (Article 8 (h)): further consideration of gaps and inconsistencies in the international regulatory framework"
    }, {
        number: 28,
        symbol: "Decision VIII/28",
        title: "Impact assessment: voluntary guidelines on biodiversity-inclusive impact assessment"
    }, {
        number: 29,
        symbol: "Decision VIII/29",
        title: "Liability and redress"
    }, {
        number: 30,
        symbol: "Decision VIII/30",
        title: "Biodiversity and climate change: guidance to promote synergy among activities for biodiversity conservation, mitigating or adapting to climate change and combating land degradation"
    }, {
        number: 31,
        symbol: "Decision VIII/31",
        title: "Administration of the Convention and budget for the programme of work for the biennium 2007-2008"
    }, {
        number: 32,
        symbol: "Decision VIII/32",
        title: "Potential impact of avian influenza on biodiversity"
    }, {
        number: 33,
        symbol: "Decision VIII/33",
        title: "Date and venue of the ninth meeting of the Conference of the Parties"
    }, {
        number: 34,
        symbol: "Decision VIII/34",
        title: "Tribute to the Government and people of the Federative Republic of Brazil"
    }
];
