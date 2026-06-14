import { BaseGlobalState } from '$lib/os/state/baseGlobalState.svelte';
export class CalendarAppState extends BaseGlobalState {
	appName = 'Calendar';
	selectedDate = $state(new Date());

	year = $derived(this.selectedDate.getFullYear());
	month = $derived(this.selectedDate.getMonth());
	monthName = $derived(
		this.selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);
	daysInMonth = $derived(new Date(this.year, this.month + 1, 0).getDate());
	firstDow = $derived(new Date(this.year, this.month, 1).getDay());
	today = $derived(new Date());

	isToday(day: number) {
		return (
			this.today.getDate() === day &&
			this.today.getMonth() === this.month &&
			this.today.getFullYear() === this.year
		);
	}

	weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	events = [
		{ time: '9:00 AM', title: 'WWDC Keynote', color: '#007AFF' },
		{ time: '12:00 PM', title: 'Lunch with Team', color: '#34C759' },
		{ time: '3:00 PM', title: 'Design Review', color: '#FF9500' }
	];

	prevMonth() {
		this.selectedDate = new Date(this.year, this.month - 1, 1);
	}

	nextMonth() {
		this.selectedDate = new Date(this.year, this.month + 1, 1);
	}

	selectDay(day: number) {
		this.selectedDate = new Date(this.year, this.month, day);
	}
}
