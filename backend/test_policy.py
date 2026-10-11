import unittest
from datetime import date, timedelta
from policy import validate_claim, CATEGORY_LIMITS


class TestExpensePolicyValidation(unittest.TestCase):

    def setUp(self):
        self.today = date.today().isoformat()
        self.existing_claims = []

    def test_valid_claim_passes(self):
        claim = {
            "claimant": "Sarthak Jain",
            "department": "Engineering",
            "date": self.today,
            "category": "meals",
            "amount": 1500,
            "currency": "INR",
            "receipt": "yes",
            "description": "Lunch meeting with client",
            "project": "Client Outreach"
        }
        issues = validate_claim(claim, self.existing_claims)
        self.assertEqual(len(issues), 0)

    def test_missing_receipt_over_threshold(self):
        claim = {
            "claimant": "Sarthak Jain",
            "date": self.today,
            "category": "meals",
            "amount": 750,
            "receipt": "no",
            "description": "Quick meal"
        }
        issues = validate_claim(claim, self.existing_claims)
        issue_titles = [i["title"] for i in issues]
        self.assertIn("Missing Receipt", issue_titles)

    def test_missing_receipt_under_threshold_allowed(self):
        claim = {
            "claimant": "Sarthak Jain",
            "date": self.today,
            "category": "meals",
            "amount": 350,
            "receipt": "no",
            "description": "Coffee and snack"
        }
        issues = validate_claim(claim, self.existing_claims)
        issue_titles = [i["title"] for i in issues]
        self.assertNotIn("Missing Receipt", issue_titles)

    def test_category_limit_exceeded(self):
        claim = {
            "claimant": "Sarthak Jain",
            "date": self.today,
            "category": "meals",
            "amount": 6500,  # Limit is 5000
            "receipt": "yes",
            "description": "Team lunch"
        }
        issues = validate_claim(claim, self.existing_claims)
        issue_titles = [i["title"] for i in issues]
        self.assertIn("Exceeds Category Limit", issue_titles)

    def test_future_date_fails(self):
        future_date = (date.today() + timedelta(days=5)).isoformat()
        claim = {
            "claimant": "Sarthak Jain",
            "date": future_date,
            "category": "travel",
            "amount": 2000,
            "receipt": "yes",
            "description": "Upcoming trip"
        }
        issues = validate_claim(claim, self.existing_claims)
        issue_titles = [i["title"] for i in issues]
        self.assertIn("Future Date", issue_titles)

    def test_late_submission_warning(self):
        late_date = (date.today() - timedelta(days=45)).isoformat()
        claim = {
            "claimant": "Sarthak Jain",
            "date": late_date,
            "category": "travel",
            "amount": 5000,
            "receipt": "yes",
            "description": "Conference travel"
        }
        issues = validate_claim(claim, self.existing_claims)
        issue_titles = [i["title"] for i in issues]
        self.assertIn("Late Submission", issue_titles)

    def test_expired_claim_over_90_days(self):
        expired_date = (date.today() - timedelta(days=95)).isoformat()
        claim = {
            "claimant": "Sarthak Jain",
            "date": expired_date,
            "category": "office_supplies",
            "amount": 1000,
            "receipt": "yes",
            "description": "Old monitor cable"
        }
        issues = validate_claim(claim, self.existing_claims)
        issue_titles = [i["title"] for i in issues]
        self.assertIn("Expired Claim", issue_titles)

    def test_duplicate_claim_detected(self):
        existing = [{
            "id": "CLM-001",
            "claimant": "Sarthak Jain",
            "date": self.today,
            "category": "travel",
            "amount": 1200
        }]
        claim = {
            "claimant": "Sarthak Jain",
            "date": self.today,
            "category": "travel",
            "amount": 1200,
            "receipt": "yes",
            "description": "Cab ride"
        }
        issues = validate_claim(claim, existing)
        issue_titles = [i["title"] for i in issues]
        self.assertIn("Potential Duplicate", issue_titles)


if __name__ == "__main__":
    unittest.main()
