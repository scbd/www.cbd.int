define(['app', 'underscore'], function(app, _) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', function($scope, $http, $route, $location, $filter, $q) {

        $scope.session   = $route.current.params.session;
        $scope.decisions = decisions[$scope.session];

        $scope.$root.page = { title: 'COP-'+$scope.session+' Decisions' };
    }];
});

decisions = { '8': [{
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
        number:  28,
        symbol: "Decision VIII/28",
        title:  "Impact assessment: voluntary guidelines on biodiversity-inclusive impact assessment"
    }, {
        number:  29,
        symbol: "Decision VIII/29",
        title:  "Liability and redress"
    }, {
        number:  30,
        symbol: "Decision VIII/30",
        title:  "Biodiversity and climate change: guidance to promote synergy among activities for biodiversity conservation, mitigating or adapting to climate change and combating land degradation"
    }, {
        number:  31,
        symbol: "Decision VIII/31",
        title:  "Administration of the Convention and budget for the programme of work for the biennium 2007-2008"
    }, {
        number:  32,
        symbol: "Decision VIII/32",
        title:  "Potential impact of avian influenza on biodiversity"
    }, {
        number: 33,
        symbol: "Decision VIII/33",
        title:  "Date and venue of the ninth meeting of the Conference of the Parties"
    }, {
        number: 34,
        symbol: "Decision VIII/34",
        title:  "Tribute to the Government and people of the Federative Republic of Brazil"
    }
], '9': [{
        number:  1,
        symbol: "Decision IX/1",
        title:  "In-depth review of the programme of work on agricultural biodiversity"
    }, {
        number:  2,
        symbol: "Decision IX/2",
        title:  "Agricultural biodiversity: biofuels and biodiversity"
    }, {
        number:  3,
        symbol: "Decision IX/3",
        title:  "Global strategy for plant conservation"
    }, {
        number:  4,
        symbol: "Decision IX/4",
        title:  "In-depth review of ongoing work on alien species that threaten ecosystems, habitats or species"
    }, {
        number:  5,
        symbol: "Decision IX/5",
        title:  "Forest biodiversity"
    }, {
        number:  6,
        symbol: "Decision IX/6",
        title:  "Incentive measures (Article 11)"
    }, {
        number:  7,
        symbol: "Decision IX/7",
        title:  "Ecosystem approach"
    }, {
        number:  8,
        symbol: "Decision IX/8",
        title:  "Review of implementation of goals 2 and 3 of the Strategic Plan"
    }, {
        number:  9,
        symbol: "Decision IX/9",
        title:  "Process for the revision of the Strategic Plan"
    }, {
        number:  11,
        symbol: "Decision IX/11",
        title:  "Review of implementation of Articles 20 and 21"
    }, {
        number:  12,
        symbol: "Decision IX/12",
        title:  "Access and benefit-sharing"
    }, {
        number:  13,
        symbol: "Decision IX/13",
        title:  "Article 8(j) and related provisions"
    }, {
        number:  14,
        symbol: "Decision IX/14",
        title:  "Technology transfer and cooperation"
    }, {
        number:  15,
        symbol: "Decision IX/15",
        title:  "Follow-up to the Millennium Ecosystem Assessment"
    }, {
        number:  16,
        symbol: "Decision IX/16",
        title:  "Biodiversity and climate change"
    }, {
        number:  17,
        symbol: "Decision IX/17",
        title:  "Biodiversity of dry and sub-humid lands"
    }, {
        number:  18,
        symbol: "Decision IX/18",
        title:  "Protected areas"
    }, {
        number:  19,
        symbol: "Decision IX/19",
        title:  "Biological diversity of inland water ecosystems"
    }, {
        number:  20,
        symbol: "Decision IX/20",
        title:  "Marine and coastal biodiversity"
    }, {
        number:  21,
        symbol: "Decision IX/21",
        title:  "Island biodiversity"
    }, {
        number:  22,
        symbol: "Decision IX/22",
        title:  "The Global Taxonomy Initiative: matters arising from decision VIII/3, including the development of outcome-oriented deliverables"
    }, {
        number:  23,
        symbol: "Decision IX/23",
        title:  "Liability and redress"
    }, {
        number:  24,
        symbol: "Decision IX/24",
        title:  "Gender Plan of Action"
    }, {
        number:  25,
        symbol: "Decision IX/25",
        title:  "South-South cooperation on biodiversity for development"
    }, {
        number:  26,
        symbol: "Decision IX/26",
        title:  "Promoting business engagement"
    }, {
        number:  27,
        symbol: "Decision IX/27",
        title:  "Cooperation among multilateral environmental agreements and other organizations"
    }, {
        number:  28,
        symbol: "Decision IX/28",
        title:  "Promoting engagement of cities and local authorities"
    }, {
        number:  29,
        symbol: "Decision IX/29",
        title:  "Operations of the Convention"
    }, {
        number:  30,
        symbol: "Decision IX/30",
        title:  "Scientific and technical cooperation and the clearing-house mechanism"
    }, {
        number:  31,
        symbol: "Decision IX/31",
        title:  "Financial resources and the financial mechanism and guidance to the financial mechanism"
    }, {
        number:  32,
        symbol: "Decision IX/32",
        title:  "Communication, education and public awareness (CEPA)"
    }, {
        number:  33,
        symbol: "Decision IX/33",
        title:  "International Year of Biodiversity"
    }, {
        number:  34,
        symbol: "Decision IX/34",
        title:  "Administration of the Convention and Budget for the programme of work for the biennium 2009-2010"
    }, {
        number:  35,
        symbol: "Decision IX/35",
        title:  "Date and venue of the tenth meeting of the Conference of the Parties"
    }, {
        number:  36,
        symbol: "Decision IX/36",
        title:  "Tribute to the Government and people of the Federal Republic of Germany"
    }]
};
