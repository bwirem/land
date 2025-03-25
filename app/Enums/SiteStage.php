<?php

namespace App\Enums;

    enum SiteStage: int
    {
        case Draft = 1;         
        case Coordinating = 2;
        case Documentation = 3; 
        case SiteOfficerReview = 4;
        case ManagerReview = 5;
        case CommitteeReview = 6;
        case Approved = 7;
        case Awarded = 8;
        case Rejected = 9; 

        public static function getLabel(int $value): string
        {
            return match ($value) {
                self::Draft->value => 'Draft',
                self::Coordinating->value => 'Coordinating',            
                self::Documentation->value => 'Documentation',            
                self::SiteOfficerReview->value => 'Site Officer Review',
                self::ManagerReview->value => 'Manager Review',
                self::CommitteeReview->value => 'Committee Review',
                self::Approved->value => 'Approved',  
                self::Awarded->value => 'Awarded',
                self::Rejected->value => 'Rejected',
                default => 'Unknown',
            };
        }
    }          
                
            
        
    