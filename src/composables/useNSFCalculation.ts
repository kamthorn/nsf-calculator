export interface CalculationResult {
    totalMemberSavings: number;
    totalGovtContribution: number;
    totalInterest: number;
    totalBalanceAt60: number;
    monthlyPension: number;
    detailsByYear: AnnualDetail[];
}

export interface AnnualDetail {
    age: number;
    memberSavingsAccumulated: number;
    govtContributionAccumulated: number;
    totalBalance: number;
    interestEarnedYear: number;
}

export const useNSFCalculation = () => {
    const calculateResult = (
        startAge: number,
        monthlySavings: number,
        annualReturnRate: number = 2.5
    ): CalculationResult => {

        // Constants
        const RETIREMENT_AGE = 60;
        const MAX_GOVT_CONTRIBUTION_YEAR = 1800;

        // Monthly interest rate conversion: (1 + r)^(1/12) - 1
        const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;

        let currentBalance = 0;
        let totalMemberSavings = 0;
        let totalGovtContribution = 0; // Principal only

        let accumulatedMemberSavings = 0;
        let accumulatedGovtContribution = 0;

        const detailsByYear: AnnualDetail[] = [];

        // Iteration from startAge to 60 (exclusive of 60? Usually "Until 60")
        // Assuming savings stop at 60th birthday.

        for (let age = startAge; age < RETIREMENT_AGE; age++) {
            let govtContribThisYear = 0;
            let interestEarnedThisYear = 0;

            // Determine Matching Rate based on Age
            let matchingRate = 0.5; // Default 15-30
            if (age >= 30 && age < 50) {
                matchingRate = 0.8;
            } else if (age >= 50) {
                matchingRate = 1.0;
            }

            // Simulate 12 months
            for (let m = 0; m < 12; m++) {
                // Interest First (End of prev month balance)
                const interest = currentBalance * monthlyRate;
                currentBalance += interest;
                interestEarnedThisYear += interest;

                // Member Savings (Beginning or End? Spreadsheet used Type 1 = Beginning)
                // If Type 1 (Beginning), interest is calculated on (Balance + Deposit).
                // Let's adjust: Balance += Deposit; Interest = Balance * Rate; Balance += Interest.
                // Assuming savings deposited at Start of Month:
                currentBalance += monthlySavings;
                totalMemberSavings += monthlySavings;
                accumulatedMemberSavings += monthlySavings;

                // Government Contribution
                // Logic: Matches savings, but capped annually.
                // We calculate what "would" be added this month.
                let potentialMatch = monthlySavings * matchingRate;

                // Check annual cap
                if (govtContribThisYear + potentialMatch > MAX_GOVT_CONTRIBUTION_YEAR) {
                    potentialMatch = Math.max(0, MAX_GOVT_CONTRIBUTION_YEAR - govtContribThisYear);
                }

                currentBalance += potentialMatch;
                totalGovtContribution += potentialMatch;
                accumulatedGovtContribution += potentialMatch;
                govtContribThisYear += potentialMatch;
            }

            detailsByYear.push({
                age,
                memberSavingsAccumulated: accumulatedMemberSavings,
                govtContributionAccumulated: accumulatedGovtContribution,
                totalBalance: currentBalance,
                interestEarnedYear: interestEarnedThisYear
            });
        }

        const totalInterest = currentBalance - totalMemberSavings - totalGovtContribution;

        // Pension Calculation (Annuity)
        // PMT formula: P * r / (1 - (1+r)^-n)
        // N = 20 years * 12 months = 240
        const PAYOUT_YEARS = 20;
        const monthsPayout = PAYOUT_YEARS * 12;

        let monthlyPension = 0;
        if (monthlyRate > 0) {
            monthlyPension = (currentBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -monthsPayout));
        } else {
            monthlyPension = currentBalance / monthsPayout;
        }

        // NSF Rule: If pension < 600, pay 600 until depleted.
        // However, the calculator usually shows the "Calculated" rate strictly, 
        // or notes the 600 minimum. Let's return the calculated one and handle display logic in UI.

        return {
            totalMemberSavings,
            totalGovtContribution,
            totalInterest,
            totalBalanceAt60: currentBalance,
            monthlyPension,
            detailsByYear
        };
    };

    return {
        calculateResult
    };
};
