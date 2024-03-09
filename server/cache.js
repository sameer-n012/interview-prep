import loki from 'lokijs';

export const QuestionDBManager = class {
	db = null;
	questions = null;

	constructor(name) {
		this.db = new loki(name);
		this.questions = this.db.getCollection('questions');
		if (!this.questions) {
			this.questions = this.db.addCollection('questions');
		}
	}

	insert(topic, text) {
		this.questions.insert({
			time: new Date(),
			topic: topic,
			text: text,
		});
	}

	getRecent(s, n) {
		return this.questions.chain().find({}).simplesort('time', true).offset(s).limit(n).data();
	}

	getSimilar(text, s, n) {
		return this.questions
			.chain()
			.find({
				'$or': [
					{
						'text': {
							'$contains': text,
						},
					},
					{
						'topic': {
							'$contains': text,
						},
					}
				]
			})
			.simplesort('time', true)
			.offset(s)
			.limit(n)
			.data();
	}

    save() {
		this.db ? this.db.saveDatabase() : undefined;
    }
};
